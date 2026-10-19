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
};

export type Email = {
	path: string;
	headers: EmailHeaders;
	body: string;
};

/**
 * One row in the message list. `subject` and `day` come from the file path, so a row is useful
 * before its file is read. `headers` is null until the file was read, and stays null when the read
 * failed.
 */
export type EmailRow = {
	path: string;
	subject: string;
	day: string;
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

type ListedChild = { path: string; name: string; kind: "folder" | "file" };

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
 * List every child of one folder, following the cursor.
 *
 * This reads the whole folder. That is fine for the Gmail layout: an account folder holds years, a
 * year holds months, and only a month folder holds emails, so one folder is one month of mail.
 */
async function list_folder(client: BonoboClient, path: string) {
	const children: ListedChild[] = [];
	let cursor: string | null = null;

	for (;;) {
		const answer: BonoboHttpResponse<"/api/v1/files/list"> = await fetch_json_with_429_retry(client, "/api/v1/files/list", {
			path,
			cursor,
			limit: 100,
		});
		if (answer.status === 400 && answer.body && "errorCode" in answer.body && answer.body.errorCode === "invalid_cursor") {
			// A Move or Rename anywhere in the workspace ends open cursors. Start this folder again.
			children.length = 0;
			cursor = null;
			continue;
		}
		// A locked folder answers 403, and a folder moved away after its parent was listed answers 404.
		// Trying again never helps, so skip it and keep reading older mail.
		if (answer.status === 403 || answer.status === 404) {
			return [];
		}
		if (answer.status !== 200 || answer.body === null || !("items" in answer.body) || answer.body.items === undefined) {
			const message = answer.body && "message" in answer.body ? answer.body.message : `HTTP ${answer.status}`;
			throw new Error(`Failed to list ${path}: ${message}`);
		}

		for (const item of answer.body.items) {
			children.push({ path: item.path, name: item.name, kind: item.kind });
		}
		if (answer.body.isDone) {
			return children;
		}
		cursor = answer.body.cursor;
	}
}

/**
 * Walk one account newest first, one folder of emails per `next()` call.
 *
 * The walk keeps a stack of folders. Folder names are years and months, so a reverse name sort is a
 * newest-first sort. Files sort by `email_sort_key`.
 */
export type MailboxWalk = { next(): Promise<EmailRow[] | null> };

export function create_mailbox_walk(client: BonoboClient, accountPath: string): MailboxWalk {
	const stack: { folders: string[] }[] = [{ folders: [accountPath] }];

	return {
		async next(): Promise<EmailRow[] | null> {
			while (stack.length > 0) {
				const top = stack[stack.length - 1];
				const folderPath = top.folders[0];
				if (folderPath === undefined) {
					stack.pop();
					continue;
				}

				// Take the folder off the stack only after it was listed, so a failed list is tried again.
				const children = await list_folder(client, folderPath);
				top.folders.shift();
				const desc = (a: string, b: string) => (a < b ? 1 : a > b ? -1 : 0);
				// The Gmail plugin saves attachments in a `<email>-attachments` folder next to the email.
				const folders = children
					.filter((child) => child.kind === "folder" && !child.name.endsWith("-attachments"))
					.sort((a, b) => desc(a.name, b.name));
				const files = children
					.filter((child) => child.kind === "file" && child.name.endsWith(".md"))
					.sort((a, b) => desc(email_sort_key(a.name), email_sort_key(b.name)));

				if (folders.length > 0) {
					stack.push({ folders: folders.map((folder) => folder.path) });
				}
				if (files.length > 0) {
					return files.map((file) => ({
						path: file.path,
						subject: subject_from_name(file.path),
						day: day_from_path(file.path),
						headers: null,
					}));
				}
			}

			return null;
		},
	};
}
