import type { BonoboClient } from "bonobo-plugin-sdk/frontend";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { gmail_ApiError, gmail_new_request_id, gmail_page_post, gmail_status_response } from "./gmail-api";
import { register_mail_tools, type MailAccount, type MailView } from "./mail-agent-tools";
import {
	create_draft,
	delete_draft,
	get_draft,
	list_drafts,
	new_draft_id,
	update_draft,
	type DraftFields,
	type DraftRow,
	type DraftText,
} from "./mail-drafts";
import { create_mailbox_walk, read_email, type Email, type EmailRow, type MailboxWalk } from "./mail-emails";
import { get_error_message } from "./mail-retry";
import { send_draft } from "./mail-send";
import "./mail.css";

/**
 * Rows shown per "Show more". Each shown row reads its file once.
 */
const PAGE_SIZE = 30;

/**
 * The SDK README asks for about 4 calls in flight per route.
 */
const ROW_READ_CONCURRENCY = 4;

/**
 * How much of an email a reply quotes. Even with 3-byte characters this stays far under the 50 KB
 * draft limit.
 */
const MAX_QUOTED_CHARS = 3000;

/**
 * Save typed text this long after the member stops typing. Each save makes a new message in Gmail,
 * so do not save on every short pause. Leaving a field saves at once.
 */
const AUTOSAVE_DELAY_MS = 10_000;

/**
 * Read the draft list again this often while the page is visible, as the Gmail page reads its
 * status. A draft made or sent elsewhere in Press then shows up.
 */
const DRAFTS_POLL_MS = 5000;

type Selection = { kind: "email"; path: string } | { kind: "draft"; id: string } | null;

type ReplyDraft = { fields: DraftFields; replyToGmailMessageId: string | null };

function format_date(iso: string) {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) {
		return "";
	}
	return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function sender_name(from: string) {
	const match = /^\s*"?([^"<]+?)"?\s*<[^>]+>\s*$/u.exec(from);
	return match ? match[1] : from;
}

function addresses_text(addresses: string[]) {
	return addresses.join(", ");
}

function parse_addresses(text: string) {
	return text
		.split(/[,;\n]/u)
		.map((part) => part.trim())
		.filter((part) => part.length > 0);
}

/**
 * The address part only. A display name such as `"ceo@company.com" <someone@else.io>` cannot hide
 * where the email really goes.
 */
function bare_address(recipient: string) {
	return /<([^<>]+)>\s*$/u.exec(recipient)?.[1] ?? recipient;
}

function reply_draft(email: Email): ReplyDraft {
	const subject = /^re:/iu.test(email.headers.subject) ? email.headers.subject : `Re: ${email.headers.subject}`;
	// Quote only the start of a long email.
	const quotedText = email.body.length > MAX_QUOTED_CHARS ? `${email.body.slice(0, MAX_QUOTED_CHARS)}…` : email.body;
	const quoted = quotedText
		.split("\n")
		.map((line) => `> ${line}`)
		.join("\n");
	return {
		fields: {
			to: email.headers.direction === "sent" ? email.headers.to : [email.headers.from],
			cc: [],
			subject,
			body: `\n\nOn ${format_date(email.headers.date)}, ${email.headers.from} wrote:\n${quoted}`,
		},
		replyToGmailMessageId: email.headers.gmailMessageId,
	};
}

/**
 * Why this member cannot write drafts for the account, or null when they can.
 */
function compose_block(account: MailAccount) {
	if (!account.isComposer) {
		return `Only the member who connected ${account.emailAddress} can write drafts for it.`;
	}
	if (!account.canCompose) {
		return `Drafts are off for ${account.emailAddress}. Open the Gmail page and press Allow drafts and Send.`;
	}
	return null;
}

/**
 * Read every connected account from the status route. It pages 25 accounts at a time.
 *
 * It also renews the sync's Press grant when Press stopped accepting it. A plugin update does that:
 * Press ties each grant to the installed version, and only an open plugin page can get a new one.
 * The Gmail page does the same, so sync keeps running for a member who only opens Mail.
 */
async function list_accounts(client: Pick<BonoboClient, "getToken" | "refreshToken">) {
	const accounts: MailAccount[] = [];
	let cursor: string | null = null;
	do {
		const page: z.infer<typeof gmail_status_response> = await gmail_page_post(client, "/page/status", { cursor }, gmail_status_response);
		for (const account of page.accounts) {
			if (account.canRepair) {
				gmail_page_post(
					client,
					"/page/press-repair",
					{ accountId: account.accountId, expectedGeneration: account.connectionGeneration, clientRequestId: gmail_new_request_id() },
					z.object({}),
				).catch((error: unknown) => {
					console.error("[MailApp.list_accounts] Failed to renew the Press grant", { error, accountId: account.accountId });
				});
			}
			if (account.syncStatus !== "disconnected") {
				accounts.push({
					accountId: account.accountId,
					emailAddress: account.emailAddress,
					destinationPath: account.destinationPath,
					canCompose: account.canCompose,
					isComposer: account.isComposer,
				});
			}
		}
		cursor = page.cursor;
	} while (cursor !== null);
	return accounts;
}

export function MailApp(props: { client: BonoboClient }) {
	const { client } = props;

	const [accounts, setAccounts] = useState<MailAccount[] | null>(null);
	const [accountId, setAccountId] = useState<string | null>(null);
	const [folder, setFolder] = useState<MailView["folder"]>("all");
	const [rows, setRows] = useState<EmailRow[]>([]);
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
	const [walkDone, setWalkDone] = useState(false);
	const [loading, setLoading] = useState(false);
	const [listError, setListError] = useState<string | null>(null);
	const [selection, setSelection] = useState<Selection>(null);
	const [openEmail, setOpenEmail] = useState<Email | null>(null);
	const [readerError, setReaderError] = useState<string | null>(null);
	const [drafts, setDrafts] = useState<DraftRow[] | null>(null);
	const [moreDrafts, setMoreDrafts] = useState(false);
	const [draftsError, setDraftsError] = useState<string | null>(null);
	const [composeError, setComposeError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);

	const account = accounts?.find((candidate) => candidate.accountId === accountId) ?? null;
	const composeBlock = account ? compose_block(account) : null;

	const walk = useMemo(
		() => (account === null ? null : create_mailbox_walk(client, account.destinationPath)),
		[client, account?.destinationPath],
	);
	// The walk that owns the list. A result from an older walk is dropped.
	const walkRef = useRef<MailboxWalk | null>(null);
	// The walk shares one folder stack, so only one fill may run at a time.
	const fillingRef = useRef(false);
	// Row reads: paths waiting, paths already queued, and how many reads run now.
	const rowReadQueueRef = useRef<string[]>([]);
	const rowReadQueuedRef = useRef(new Set<string>());
	const rowReadsActiveRef = useRef(0);
	// The email the member asked for last. A slower read of an older click is dropped.
	const requestedEmailRef = useRef<string | null>(null);

	// The agent tools run outside React. Give them the latest view on every call.
	const viewRef = useRef<MailView>({ account, folder, rows, openEmail, openDraftId: null, drafts: [] });
	viewRef.current = {
		account,
		folder,
		rows,
		openEmail: selection?.kind === "email" ? openEmail : null,
		openDraftId: selection?.kind === "draft" ? selection.id : null,
		drafts: drafts ?? [],
	};

	/**
	 * Read the draft list now. The agent tools call this too, so read the account from the latest
	 * view, and drop the answer when the member switched account meanwhile.
	 */
	const reload_drafts = async () => {
		const current = viewRef.current.account;
		if (current === null || compose_block(current) !== null) {
			return;
		}

		const page = await list_drafts(client, current.accountId, null);
		if (viewRef.current.account?.accountId === current.accountId) {
			setDraftsError(null);
			setDrafts(page.drafts);
			setMoreDrafts(page.cursor !== null);
		}
	};

	// A failed read keeps the old list. The next poll tries again.
	const refresh_drafts = () => {
		reload_drafts().catch(() => {});
	};

	const show_email = (email: Email) => {
		requestedEmailRef.current = email.path;
		setFolder("all");
		setSelection({ kind: "email", path: email.path });
		setOpenEmail(email);
		setReaderError(null);
	};

	const open_email = (path: string) => {
		requestedEmailRef.current = path;
		setSelection({ kind: "email", path });
		setOpenEmail(null);
		setReaderError(null);
		read_email(client, path).then(
			(email) => {
				if (requestedEmailRef.current === path) {
					setOpenEmail(email);
				}
			},
			(readError: unknown) => {
				if (requestedEmailRef.current === path) {
					setReaderError(get_error_message(readError));
				}
			},
		);
	};

	const open_draft = (id: string) => {
		requestedEmailRef.current = null;
		setFolder("drafts");
		setSelection({ kind: "draft", id });
		setNotice(null);
	};

	// Save a new draft in Gmail at once, so the editor always edits a saved draft.
	const start_draft = (draft: ReplyDraft) => {
		if (account === null) {
			return;
		}

		const id = new_draft_id();
		setComposeError(null);
		// Open the draft only after the list has it, so the reader never says it is missing.
		create_draft(client, { accountId: account.accountId, clientDraftId: id, ...draft, byAgent: false })
			.then(() => reload_drafts().catch(() => {}))
			.then(
				() => open_draft(id),
				(saveError: unknown) => setComposeError(get_error_message(saveError)),
			);
	};

	/**
	 * Read older folders until the list holds `target` rows or the account has no more mail.
	 */
	const fill_rows = (fromWalk: MailboxWalk, listed: number, target: number) => {
		if (fillingRef.current) {
			return;
		}
		fillingRef.current = true;
		setLoading(true);
		setListError(null);

		const step = async () => {
			let count = listed;
			while (count < target) {
				const next = await fromWalk.next();
				// The member switched accounts. Drop what this walk found.
				if (walkRef.current !== fromWalk) {
					return;
				}
				if (next === null) {
					setWalkDone(true);
					return;
				}
				count += next.length;
				// Append, so row reads that finished meanwhile are kept.
				setRows((current) => [...current, ...next]);
			}
		};
		step()
			.catch((walkError: unknown) => {
				if (walkRef.current === fromWalk) {
					setListError(get_error_message(walkError));
				}
			})
			.finally(() => {
				fillingRef.current = false;
				if (walkRef.current === fromWalk) {
					setLoading(false);
				}
			});
	};

	const load_more = () => {
		if (walk === null || loading) {
			return;
		}

		const target = visibleCount + PAGE_SIZE;
		setVisibleCount(target);
		if (rows.length < target && !walkDone) {
			fill_rows(walk, rows.length, target);
		}
	};

	const pump_row_reads = () => {
		while (rowReadsActiveRef.current < ROW_READ_CONCURRENCY) {
			const path = rowReadQueueRef.current.shift();
			if (path === undefined) {
				return;
			}

			rowReadsActiveRef.current += 1;
			read_email(client, path)
				.then(
					(email) =>
						setRows((current) =>
							current.map((row) => (row.path === path ? { ...row, headers: email.headers } : row)),
						),
					// Keep the row with the subject and day from its path.
					() => {},
				)
				.finally(() => {
					rowReadsActiveRef.current -= 1;
					pump_row_reads();
				});
		}
	};

	// Find the connected accounts once.
	useEffect(() => {
		list_accounts(client).then(
			(found) => {
				setAccounts(found);
				setAccountId(found[0]?.accountId ?? null);
			},
			(listAccountsError: unknown) => {
				setAccounts([]);
				setListError(get_error_message(listAccountsError));
			},
		);
	}, [client]);

	// Start the list again when the account changes.
	useEffect(() => {
		setRows([]);
		setDrafts(null);
		setSelection(null);
		setOpenEmail(null);
		requestedEmailRef.current = null;
		setVisibleCount(PAGE_SIZE);
		setWalkDone(false);
		setLoading(false);
		rowReadQueueRef.current = [];
		rowReadQueuedRef.current.clear();
		walkRef.current = walk;
		fillingRef.current = false;
		if (walk === null) {
			return;
		}

		fill_rows(walk, 0, PAGE_SIZE);
	}, [walk]);

	// Queue a read for each shown row that was not read yet.
	useEffect(() => {
		for (const row of rows.slice(0, visibleCount)) {
			if (row.headers === null && !rowReadQueuedRef.current.has(row.path)) {
				rowReadQueuedRef.current.add(row.path);
				rowReadQueueRef.current.push(row.path);
			}
		}
		pump_row_reads();
	}, [client, rows, visibleCount]);

	// Read this member's drafts now, then every few seconds while the page is visible.
	useEffect(() => {
		if (account === null || composeBlock !== null) {
			return;
		}

		const read = () => {
			if (document.visibilityState !== "visible") {
				return;
			}
			reload_drafts().catch((listError: unknown) => setDraftsError(get_error_message(listError)));
		};
		read();
		const timer = setInterval(read, DRAFTS_POLL_MS);
		return () => clearInterval(timer);
	}, [client, account?.accountId, composeBlock]);

	// Register the agent tools for as long as the page is open.
	useEffect(
		() =>
			register_mail_tools(client, {
				getView: () => viewRef.current,
				showEmail: show_email,
				showDraft: open_draft,
				refreshDrafts: reload_drafts,
			}),
		[client],
	);

	const selectedDraft =
		selection?.kind === "draft" ? (drafts ?? []).find((draft) => draft.clientDraftId === selection.id) ?? null : null;

	return (
		<div className="mail">
			<nav className="mail-rail" aria-label="Mailboxes">
				<button
					className="button is-primary"
					disabled={account === null || composeBlock !== null}
					onClick={() => start_draft({ fields: { to: [], cc: [], subject: "", body: "" }, replyToGmailMessageId: null })}
				>
					Compose
				</button>
				{composeError !== null ? (
					<p className="mail-status is-error" role="alert">
						{composeError}
					</p>
				) : null}
				{composeBlock !== null ? <p className="mail-status">{composeBlock}</p> : null}
				<button
					className="mail-rail-item"
					aria-current={folder === "all" ? "page" : undefined}
					onClick={() => setFolder("all")}
				>
					All mail
				</button>
				<button
					className="mail-rail-item"
					aria-current={folder === "drafts" ? "page" : undefined}
					onClick={() => setFolder("drafts")}
				>
					Drafts
					{drafts !== null && drafts.length > 0 ? <span className="mail-rail-count">{drafts.length}</span> : null}
				</button>
				{accounts !== null && accounts.length > 1 ? (
					<label className="mail-rail-account">
						Account
						<select value={accountId ?? ""} onChange={(event) => setAccountId(event.currentTarget.value)}>
							{accounts.map((candidate) => (
								<option key={candidate.accountId} value={candidate.accountId}>
									{candidate.emailAddress}
								</option>
							))}
						</select>
					</label>
				) : null}
			</nav>

			<section className="mail-list" aria-label={folder === "all" ? "All mail" : "Drafts"}>
				{folder === "all" ? (
					<>
						{accounts !== null && accounts.length === 0 && listError === null ? (
							<p className="mail-status">No Gmail account is connected. Connect one on the Gmail page.</p>
						) : null}
						<ul className="mail-rows">
							{rows.slice(0, visibleCount).map((row) => (
								<li key={row.path}>
									<button
										className="mail-row"
										aria-current={selection?.kind === "email" && selection.path === row.path ? "true" : undefined}
										data-direction={row.headers?.direction ?? undefined}
										onClick={() => open_email(row.path)}
									>
										<span className="mail-row-from">
											{row.headers === null
												? ""
												: row.headers.direction === "sent"
													? `To: ${sender_name(row.headers.to[0] ?? "")}`
													: sender_name(row.headers.from)}
										</span>
										<span className="mail-row-date">{row.headers ? format_date(row.headers.date) : row.day}</span>
										<span className="mail-row-subject">{row.headers?.subject ?? row.subject}</span>
									</button>
								</li>
							))}
						</ul>
						{loading ? (
							<p className="mail-status" role="status">
								Loading…
							</p>
						) : null}
						{!loading && walk !== null && (rows.length > visibleCount || !walkDone) ? (
							<button className="button mail-more" onClick={load_more}>
								Show more
							</button>
						) : null}
						{listError !== null ? (
							<p className="mail-status is-error" role="alert">
								{listError}
							</p>
						) : null}
					</>
				) : (
					<>
						{composeBlock !== null ? <p className="mail-status">{composeBlock}</p> : null}
						{draftsError !== null ? (
							<p className="mail-status is-error" role="alert">
								{draftsError}
							</p>
						) : null}
						{drafts !== null && drafts.length === 0 ? <p className="mail-status">No drafts. Ask the agent to write one.</p> : null}
						<ul className="mail-rows">
							{(drafts ?? []).map((draft) => (
								<li key={draft.clientDraftId}>
									<button
										className="mail-row"
										aria-current={selection?.kind === "draft" && selection.id === draft.clientDraftId ? "true" : undefined}
										onClick={() => open_draft(draft.clientDraftId)}
									>
										<span className="mail-row-from">
											{draft.to.length > 0 ? `To: ${addresses_text(draft.to)}` : "No recipients"}
										</span>
										<span className="mail-row-date">
											{draft.agentEditedAt !== null ? <span className="mail-badge">Agent</span> : null}
										</span>
										<span className="mail-row-subject">{draft.subject || "(no subject)"}</span>
									</button>
								</li>
							))}
						</ul>
						{moreDrafts ? <p className="mail-status">Showing the 25 newest drafts.</p> : null}
					</>
				)}
			</section>

			<main className="mail-reader">
				{notice !== null ? (
					<p className="mail-status" role="status">
						{notice}
					</p>
				) : null}
				{selection === null && notice === null ? <p className="mail-status">Choose an email or a draft.</p> : null}
				{selection?.kind === "email" ? (
					readerError !== null ? (
						<p className="mail-status is-error" role="alert">
							{readerError}
						</p>
					) : openEmail === null || openEmail.path !== selection.path ? (
						<p className="mail-status" role="status">
							Opening…
						</p>
					) : (
						<EmailReader
							email={openEmail}
							replyBlock={composeBlock}
							onReply={() => start_draft(reply_draft(openEmail))}
						/>
					)
				) : null}
				{selection?.kind === "draft" && account !== null ? (
					selectedDraft !== null && !selectedDraft.saving ? (
						<DraftEditor
							// Reload the editor only when the agent saved the draft, so an agent edit shows at
							// once. The member's own saves keep the editor and what they typed.
							key={`${selectedDraft.clientDraftId}:${selectedDraft.agentEditedAt ?? 0}`}
							client={client}
							accountId={account.accountId}
							draft={selectedDraft}
							onChanged={refresh_drafts}
							onClosed={(text) => {
								setSelection(null);
								setNotice(text);
								refresh_drafts();
							}}
						/>
					) : (
						<p className="mail-status" role="status">
							{/* The list is loaded, so a missing draft was deleted, sent, or is past the first 25. */}
							{drafts === null || selectedDraft?.saving
								? "Opening the draft…"
								: "This draft is not available. It may have been sent or deleted."}
						</p>
					)
				) : null}
			</main>
		</div>
	);
}

function EmailReader(props: { email: Email; replyBlock: string | null; onReply: () => void }) {
	const { email, replyBlock, onReply } = props;

	return (
		<article className="mail-email" aria-label={email.headers.subject}>
			<header className="mail-email-header">
				<h1>{email.headers.subject}</h1>
				<dl>
					<dt>From</dt>
					<dd>{email.headers.from}</dd>
					<dt>To</dt>
					<dd>{addresses_text(email.headers.to)}</dd>
					{email.headers.cc.length > 0 ? (
						<>
							<dt>Cc</dt>
							<dd>{addresses_text(email.headers.cc)}</dd>
						</>
					) : null}
					<dt>Date</dt>
					<dd>{format_date(email.headers.date)}</dd>
				</dl>
				<div className="mail-actions">
					<button className="button" disabled={replyBlock !== null || email.headers.gmailMessageId === null} onClick={onReply}>
						Reply
					</button>
					{replyBlock !== null ? <span className="mail-draft-status">{replyBlock}</span> : null}
				</div>
			</header>
			<div className="mail-email-body">{email.body}</div>
		</article>
	);
}

function DraftEditor(props: {
	client: BonoboClient;
	accountId: string;
	draft: DraftRow;
	onChanged: () => void;
	onClosed: (notice: string) => void;
}) {
	const { client, accountId, draft, onChanged, onClosed } = props;

	const [loaded, setLoaded] = useState<DraftText | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [to, setTo] = useState("");
	const [cc, setCc] = useState("");
	const [subject, setSubject] = useState("");
	const [body, setBody] = useState("");
	const [edited, setEdited] = useState(false);
	const [busy, setBusy] = useState(false);
	const [status, setStatus] = useState<{ text: string; isError: boolean } | null>(null);

	const target = { accountId, clientDraftId: draft.clientDraftId };

	const run = (action: () => Promise<void>, doneText: string) => {
		setBusy(true);
		setStatus(null);
		action().then(
			() => {
				setBusy(false);
				setStatus({ text: doneText, isError: false });
			},
			(actionError: unknown) => {
				setBusy(false);
				setStatus({ text: get_error_message(actionError), isError: true });
			},
		);
	};

	const fields = (): DraftFields => ({
		to: parse_addresses(to),
		cc: parse_addresses(cc),
		subject,
		body,
	});

	const save = () => {
		setEdited(false);
		return update_draft(client, { ...target, fields: fields(), byAgent: false }).then(onChanged);
	};

	const handle_save = () => run(save, "Saved to Gmail");

	// Save in the background, without blocking the buttons. A click on Send right after typing must
	// still reach Send.
	const autosave = () =>
		save().then(
			() => setStatus({ text: "Saved to Gmail", isError: false }),
			(saveError: unknown) => setStatus({ text: get_error_message(saveError), isError: true }),
		);

	const handle_copy = () =>
		run(async () => {
			const current = fields();
			const text = [
				`To: ${addresses_text(current.to)}`,
				...(current.cc.length > 0 ? [`Cc: ${addresses_text(current.cc)}`] : []),
				`Subject: ${current.subject}`,
				"",
				current.body,
			].join("\n");
			await navigator.clipboard.writeText(text);
		}, "Copied");

	// Stop a pending autosave first, or it could save the draft again after the delete.
	const handle_delete = () => {
		setEdited(false);
		run(async () => {
			await delete_draft(client, accountId, draft.clientDraftId);
			onClosed("Draft deleted.");
		}, "Deleted");
	};

	// Send exactly what the editor shows. A save that lands at the same moment cannot change it.
	const handle_send = () => {
		const current = fields();
		setEdited(false);
		setBusy(true);
		setStatus({ text: "Sending…", isError: false });
		send_draft(client, { ...target, fields: current }).then(
			() => onClosed(`Sent: ${current.subject || "(no subject)"}`),
			(sendError: unknown) => {
				setBusy(false);
				// After a timeout or a lost answer, Gmail may have sent the email anyway.
				const unknown =
					!(sendError instanceof gmail_ApiError) || ["send_unknown", "service_unavailable"].includes(sendError.code);
				setStatus({
					text: unknown
						? `We could not confirm that “${current.subject || "(no subject)"}” was sent. Check Sent in Gmail before you press Send again.`
						: get_error_message(sendError),
					isError: true,
				});
			},
		);
	};

	// Load the draft text from Gmail. Drop the answer when the editor closed meanwhile.
	useEffect(() => {
		let closed = false;
		get_draft(client, accountId, draft.clientDraftId).then(
			(text) => {
				if (closed) {
					return;
				}
				setLoaded(text);
				setTo(addresses_text(text.to));
				setCc(addresses_text(text.cc));
				setSubject(text.subject);
				setBody(text.body);
			},
			(getError: unknown) => {
				if (closed) {
					return;
				}
				// The draft was sent or deleted in Gmail. The backend already dropped it from the list.
				if (getError instanceof gmail_ApiError && getError.code === "draft_gone") {
					onClosed(get_error_message(getError));
					return;
				}
				setLoadError(get_error_message(getError));
			},
		);
		return () => {
			closed = true;
		};
	}, [client, accountId, draft.clientDraftId]);

	// Save typed text a while after the member stops typing. Leaving the editor clears the timer, so
	// a late save never writes over an agent edit that reloaded the editor.
	useEffect(() => {
		if (!edited) {
			return;
		}

		const timer = setTimeout(autosave, AUTOSAVE_DELAY_MS);
		return () => clearTimeout(timer);
	}, [edited, to, cc, subject, body]);

	if (loadError !== null) {
		return (
			<p className="mail-status is-error" role="alert">
				{loadError}
			</p>
		);
	}
	if (loaded === null) {
		return (
			<p className="mail-status" role="status">
				Opening the draft…
			</p>
		);
	}

	const recipients = [...parse_addresses(to), ...parse_addresses(cc)].map(bare_address);
	// Save on blur only when something changed since the last save.
	const save_on_blur = () => {
		if (edited) {
			autosave();
		}
	};

	return (
		<form
			className="mail-draft"
			aria-label="Draft"
			onSubmit={(event) => {
				event.preventDefault();
				handle_save();
			}}
		>
			{/* Fields are read-only while Save, Send, or Delete runs, so typing cannot start an autosave then. */}
			<header className="mail-draft-header">
				<h1>Draft</h1>
				{draft.agentEditedAt !== null ? <span className="mail-badge">Edited by the agent</span> : null}
			</header>
			<label className="mail-field">
				<span>To</span>
				<input value={to} readOnly={busy} onBlur={save_on_blur} onInput={(event) => {
						setTo(event.currentTarget.value);
						setEdited(true);
					}} autoComplete="off" />
			</label>
			<label className="mail-field">
				<span>Cc</span>
				<input value={cc} readOnly={busy} onBlur={save_on_blur} onInput={(event) => {
						setCc(event.currentTarget.value);
						setEdited(true);
					}} autoComplete="off" />
			</label>
			<label className="mail-field">
				<span>Subject</span>
				<input value={subject} readOnly={busy} onBlur={save_on_blur} onInput={(event) => {
						setSubject(event.currentTarget.value);
						setEdited(true);
					}} />
			</label>
			<label className="mail-field is-body">
				<span>Body</span>
				<textarea value={body} readOnly={busy} onBlur={save_on_blur} onInput={(event) => {
						setBody(event.currentTarget.value);
						setEdited(true);
					}} />
			</label>
			<p className="mail-note" data-mail-send-recipients={recipients.join(",")}>
				{recipients.length > 0 ? `Send goes to: ${recipients.join(", ")}` : "Add a recipient to send."}
			</p>
			<div className="mail-actions">
				<button className="button is-primary" type="button" disabled={busy || recipients.length === 0} onClick={handle_send}>
					Send
				</button>
				<button className="button" type="submit" disabled={busy}>
					Save
				</button>
				<button className="button" type="button" disabled={busy} onClick={handle_copy}>
					Copy
				</button>
				<button className="button" type="button" disabled={busy} onClick={handle_delete}>
					Delete
				</button>
				{status !== null ? (
					<span className={status.isError ? "mail-draft-status is-error" : "mail-draft-status"} role={status.isError ? "alert" : "status"}>
						{status.text}
					</span>
				) : null}
			</div>
			<p className="mail-note">
				This is a Gmail draft. It also shows in Gmail, where Gmail's own Send works. When the agent changes this
				draft, its version replaces text you did not save.
			</p>
		</form>
	);
}
