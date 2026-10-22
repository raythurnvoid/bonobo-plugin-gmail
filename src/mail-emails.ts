import type { BonoboClient } from "bonobo-plugin-sdk/frontend";
import type { BonoboHttpResponse } from "bonobo-plugin-sdk/http-api";
import { fetch_json_with_429_retry } from "./mail-retry";

/**
 * The sync saves each email as `<account destination>/<YYYY>/<MM>/<DD>-<subject>-<gmail id>.md`.
 * The Mail page reads that layout. It never writes these files.
 */

export type EmailHeaders = {
	from: string;
	to: string[];
	cc: string[];
	subject: string;
	date: string;
	direction: "sent" | "received" | null;
	gmailMessageId: string | null;
	gmailThreadId: string | null;
	/**
	 * True when Gmail's DMARC check failed, so Gmail could not confirm the sender's address.
	 */
	senderUnconfirmed: boolean;
};

export type Email = {
	path: string;
	headers: EmailHeaders;
	body: string;
};

/**
 * One row in the message list. `subject` and `day` come from the file path, so a row is useful
 * before its file is read. `headers` is null until the file was read, and stays null when the read
 * failed. A `locked` row is a file the member cannot open in Files. It shows its name only and is
 * never read.
 */
export type EmailRow = {
	path: string;
	subject: string;
	day: string;
	locked: boolean;
	headers: EmailHeaders | null;
};

function read_string(value: unknown) {
	return typeof value === "string" ? value : "";
}

function read_strings(value: unknown) {
	return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

/**
 * Build a readable subject from the file name when the file has no `subject` line.
 */
function subject_from_name(path: string) {
	const name = path.slice(path.lastIndexOf("/") + 1).replace(/\.md$/u, "");
	return name.replace(/^\d{2}-/u, "").replace(/-[0-9a-f]+$/u, "").replace(/-/gu, " ") || "(no subject)";
}

/**
 * Read `YYYY-MM-DD` from a `.../<YYYY>/<MM>/<DD>-...` path, or "" for another layout.
 */
function day_from_path(path: string) {
	const match = /\/(\d{4})\/(\d{2})\/(\d{2})-[^/]*$/u.exec(path);
	return match ? `${match[1]}-${match[2]}-${match[3]}` : "";
}

/**
 * Parse an email file the Gmail plugin wrote. Every frontmatter line is `key: <JSON value>`.
 */
export function parse_email_markdown(path: string, content: string): Email {
	const fields: Record<string, unknown> = {};
	let body = content;

	if (content.startsWith("---\n")) {
		const end = content.indexOf("\n---\n", 4);
		const frontmatter = end === -1 ? "" : content.slice(4, end);
		body = end === -1 ? content : content.slice(end + 5);

		for (const line of frontmatter.split("\n")) {
			const separator = line.indexOf(": ");
			if (separator === -1) {
				continue;
			}

			try {
				fields[line.slice(0, separator)] = JSON.parse(line.slice(separator + 2));
			} catch {
				// Not a line the Gmail plugin wrote. Skip it.
			}
		}
	}

	// Drop the `# subject` title and the "Open in Gmail" link. The reader shows both in its header.
	body = body.replace(/^\s*# [^\n]*\n+/u, "").replace(/^\[Open in Gmail\]\([^)]*\)\n+/u, "");

	const direction = fields.direction;
	return {
		path,
		headers: {
			from: read_string(fields.from),
			to: read_strings(fields.to),
			cc: read_strings(fields.cc),
			subject: read_string(fields.subject) || subject_from_name(path),
			date: read_string(fields.date),
			direction: direction === "sent" || direction === "received" ? direction : null,
			gmailMessageId: read_string(fields["gmail-message-id"]) || null,
			gmailThreadId: read_string(fields["gmail-thread-id"]) || null,
			senderUnconfirmed: fields.dmarc === "fail",
		},
		body: body.trimEnd(),
	};
}

/**
 * Read one email file. The read door has no partial read, so a list row reads the whole file too.
 */
export async function read_email(client: BonoboClient, path: string) {
	const answer = await fetch_json_with_429_retry(client, "/api/v1/files/read", { path });
	if (answer.status !== 200 || answer.body === null || !("content" in answer.body)) {
		const message = answer.body && "message" in answer.body ? answer.body.message : `HTTP ${answer.status}`;
		throw new Error(`Failed to read ${path}: ${message}`);
	}

	return parse_email_markdown(path, answer.body.content);
}

type ListedChild = { path: string; name: string; kind: "folder" | "file"; locked: boolean };

/**
 * Sort key for an email file: its day, then its Gmail id. A plain name sort would put one day's
 * emails in subject order. Gmail ids grow with time in practice, so the id puts them in time order.
 * Google does not promise this. If it is ever wrong, only the order inside one day changes.
 */
function email_sort_key(name: string) {
	const match = /^(\d{2})-.*-([0-9a-f]{1,16})\.md$/u.exec(name);
	// Pad the id, so a string sort is a number sort.
	return match ? `${match[1]}-${match[2].padStart(16, "0")}` : name;
}

/**
 * The day part of an email file name (`DD`). A file with another name is a group of its own.
 */
function day_key(name: string) {
	return /^(\d{2})-/u.exec(name)?.[1] ?? name;
}

/**
 * Read one page of a folder's children of one kind, in reverse name order.
 */
async function list_page(client: BonoboClient, path: string, kind: "folder" | "file", cursor: string | null) {
	const answer: BonoboHttpResponse<"/api/v1/files/list"> = await fetch_json_with_429_retry(client, "/api/v1/files/list", {
		path,
		kind,
		order: "desc",
		cursor,
		limit: 100,
	});
	// A Move or Rename anywhere in the workspace ends open cursors.
	if (answer.status === 400 && answer.body && "errorCode" in answer.body && answer.body.errorCode === "invalid_cursor") {
		return "invalid_cursor";
	}
	// A locked folder answers 403, and a folder moved away after its parent was listed answers 404.
	// Trying again never helps, so the walk skips it and keeps reading older mail.
	if (answer.status === 403) {
		return "locked";
	}
	if (answer.status === 404) {
		return "missing";
	}
	if (answer.status !== 200 || answer.body === null || !("items" in answer.body) || answer.body.items === undefined) {
		const message = answer.body && "message" in answer.body ? answer.body.message : `HTTP ${answer.status}`;
		throw new Error(`Failed to list ${path}: ${message}`);
	}

	return {
		children: answer.body.items.map((item): ListedChild => ({ path: item.path, name: item.name, kind: item.kind, locked: item.locked })),
		cursor: answer.body.cursor,
		isDone: answer.body.isDone,
	};
}

/**
 * List every child folder of an account or year folder, newest first. An account folder holds years
 * and a year holds months, so this is a few rows. Returns null when the member cannot open the folder.
 */
async function list_folders(client: BonoboClient, path: string) {
	const folders: ListedChild[] = [];
	let cursor: string | null = null;

	for (;;) {
		const page = await list_page(client, path, "folder", cursor);
		if (page === "invalid_cursor") {
			folders.length = 0;
			cursor = null;
			continue;
		}
		if (page === "locked") {
			return null;
		}
		if (page === "missing") {
			return [];
		}

		folders.push(...page.children);
		if (page.isDone) {
			return folders;
		}
		cursor = page.cursor;
	}
}

/**
 * Read one month folder newest day first, one day per call. Returns "locked" when the member cannot
 * open the month, and null after the last day.
 *
 * File names keep only the day, so inside one day the list comes in reverse subject order. The reader
 * keeps reading pages until it sees an older day, then returns the whole day sorted by
 * `email_sort_key`. So one call reads about one day of mail, never the whole month.
 */
function create_month_reader(client: BonoboClient, monthPath: string) {
	let cursor: string | null = null;
	let isDone = false;
	// Files read but not returned yet, newest name first.
	let buffer: ListedChild[] = [];
	// After a restart the list starts again from the newest day. Skip the files already returned.
	const returned = new Set<string>();

	return async function next_day(): Promise<ListedChild[] | "locked" | null> {
		for (;;) {
			const day = buffer.length > 0 ? day_key(buffer[0].name) : null;
			const end = day === null ? -1 : buffer.findIndex((file) => day_key(file.name) !== day);
			// The first day in the buffer is whole once an older day follows it or the month ended.
			if (day !== null && (end !== -1 || isDone)) {
				const files = buffer.splice(0, end === -1 ? buffer.length : end);
				for (const file of files) {
					returned.add(file.path);
				}
				return files.sort((a, b) => (email_sort_key(a.name) < email_sort_key(b.name) ? 1 : -1));
			}
			if (isDone) {
				return null;
			}

			const page = await list_page(client, monthPath, "file", cursor);
			if (page === "invalid_cursor") {
				buffer = [];
				cursor = null;
				continue;
			}
			if (page === "locked") {
				return "locked";
			}
			if (page === "missing") {
				isDone = true;
				continue;
			}
			buffer.push(...page.children.filter((file) => file.name.endsWith(".md") && !returned.has(file.path)));
			cursor = page.cursor;
			isDone = page.isDone;
		}
	};
}

/**
 * Walk one account newest first, one day of emails per `next()` call.
 *
 * The sync writes `<account>/<YYYY>/<MM>/<DD>-...md`, so the walk lists years, then months, then
 * reads each month a day at a time. Year and month names are numbers of the same length, so reverse
 * name order is newest first. Attachment folders sit next to the emails in a month, and the month
 * read asks for files only, so it never lists them.
 *
 * `lockedFolders` lists the folders the member cannot open, in the order the walk met them. The walk
 * skips them, so the page can say which mail it could not show.
 */
export type MailboxWalk = { next(): Promise<EmailRow[] | null>; lockedFolders: string[] };

export function create_mailbox_walk(client: BonoboClient, accountPath: string): MailboxWalk {
	const lockedFolders: string[] = [];
	// Year folders still to list, newest first. Null until the account folder was listed.
	let years: string[] | null = null;
	// Month folders of the listed years still to read, newest first.
	const months: string[] = [];
	let month: { path: string; next_day: ReturnType<typeof create_month_reader> } | null = null;

	// Listing a locked folder only answers 403, so record a locked child here and do not list it.
	const open_paths = (folders: ListedChild[]) => {
		for (const folder of folders) {
			if (folder.locked) {
				lockedFolders.push(folder.path);
			}
		}
		return folders.filter((folder) => !folder.locked).map((folder) => folder.path);
	};

	return {
		lockedFolders,
		async next(): Promise<EmailRow[] | null> {
			// Change the walk state only after a list succeeded, so a failed list is tried again.
			for (;;) {
				if (month !== null) {
					const files = await month.next_day();
					if (files === "locked") {
						lockedFolders.push(month.path);
					}
					if (files === "locked" || files === null) {
						month = null;
						continue;
					}
					return files.map((file) => ({
						path: file.path,
						subject: subject_from_name(file.path),
						day: day_from_path(file.path),
						locked: file.locked,
						headers: null,
					}));
				}
				if (months.length > 0) {
					const path = months.shift()!;
					month = { path, next_day: create_month_reader(client, path) };
					continue;
				}
				if (years === null) {
					const listed = await list_folders(client, accountPath);
					if (listed === null) {
						lockedFolders.push(accountPath);
					}
					years = listed === null ? [] : open_paths(listed);
					continue;
				}

				const year = years[0];
				if (year === undefined) {
					return null;
				}
				const listed = await list_folders(client, year);
				years.shift();
				if (listed === null) {
					lockedFolders.push(year);
					continue;
				}
				months.push(...open_paths(listed));
			}
		},
	};
}
