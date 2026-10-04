import { httpRouter } from "convex/server";
import { z } from "zod";
import { httpAction, type ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { gmail_PageError, gmail_page_auth } from "./gmail_page";
import { gmail_HostError, press_HTTP_URL } from "./press";
import { gmail_callback, gmail_finish, gmail_start } from "./gmail_oauth";
import { gmail_repair } from "./gmail_accounts";

const allowedOrigins = new Set([new URL(press_HTTP_URL).origin]);
if (process.env.DEV_PLUGIN_ORIGIN) {
	const value = process.env.DEV_PLUGIN_ORIGIN;
	const parsed = new URL(value);
	if (!["http:", "https:"].includes(parsed.protocol) || parsed.origin !== value || parsed.username || parsed.password)
		throw new Error("DEV_PLUGIN_ORIGIN must be an exact HTTP(S) origin");
	allowedOrigins.add(value);
}

const http = httpRouter();
const status_body = z.object({ cursor: z.string().max(2048).nullable().optional() }).strict();
const id = z.string().min(1).max(64);
const secret = z.string().regex(/^[0-9a-f]{64}$/);
const start_body = z.object({ clientRequestId: secret, accountId: id.nullable() }).strict();
const finish_body = z.object({ attemptId: id, finishCode: secret }).strict();
const cancel_body = z.object({ attemptId: id }).strict();
const account_body = z.object({ accountId: id, expectedGeneration: z.number().int().positive() }).strict();
const repair_body = account_body.extend({ clientRequestId: secret });
const failures_body = z.object({ accountId: id, cursor: z.string().max(2048).nullable().optional() }).strict();

async function read_body(request: Request) {
	if (!request.body) return {};
	const reader = request.body.getReader();
	let size = 0;
	const chunks = [];
	while (true) {
		const next = await reader.read();
		if (next.done) break;
		size += next.value.byteLength;
		if (size > 8192) {
			await reader.cancel();
			throw new gmail_PageError(413, "body_too_large");
		}
		chunks.push(next.value);
	}
	const bytes = new Uint8Array(size);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.byteLength;
	}
	try {
		const value: unknown = JSON.parse(new TextDecoder().decode(bytes));
		return value;
	} catch {
		throw new gmail_PageError(400, "invalid_body");
	}
}

function page_route<T>(
	path: string,
	validator: z.ZodType<T>,
	changing: boolean,
	run: (
		ctx: ActionCtx,
		actor: { organizationId: string; workspaceId: string; installationId: string; actorUserId: string },
		body: T,
		token: string,
		canWrite: boolean,
	) => Promise<unknown>,
) {
	http.route({
		path,
		method: "OPTIONS",
		handler: httpAction(async (_ctx, request) => {
			const origin = request.headers.get("Origin");
			if (!origin || !allowedOrigins.has(origin)) return new Response(null, { status: 403 });
			return new Response(null, {
				status: 204,
				headers: {
					"Access-Control-Allow-Origin": origin,
					Vary: "Origin",
					"Access-Control-Allow-Methods": "POST",
					"Access-Control-Allow-Headers": "Authorization, Content-Type",
					"Access-Control-Max-Age": "600",
				},
			});
		}),
	});

	http.route({
		path,
		method: "POST",
		handler: httpAction(async (ctx, request) => {
			const origin = request.headers.get("Origin");
			if (!origin || !allowedOrigins.has(origin)) return new Response(null, { status: 403 });
			const headers = {
				"Content-Type": "application/json",
				"Cache-Control": "no-store",
				"Access-Control-Allow-Origin": origin,
				Vary: "Origin",
			};
			try {
				const parsed = validator.safeParse(await read_body(request));
				if (!parsed.success) throw new gmail_PageError(400, "invalid_body");
				const authorization = request.headers.get("Authorization") ?? "";
				if (!authorization.startsWith("Bearer ")) throw new gmail_PageError(401, "press_access_changed");
				const token = authorization.slice(7);
				const { canWrite, ...actor } = await gmail_page_auth(ctx, token, changing);
				return new Response(JSON.stringify(await run(ctx, actor, parsed.data, token, canWrite)), { headers });
			} catch (error) {
				if (error instanceof gmail_PageError)
					return new Response(JSON.stringify({ code: error.code }), { status: error.status, headers });
				if (error instanceof gmail_HostError && [401, 403, 404, 409].includes(error.status))
					return new Response(JSON.stringify({ code: "press_access_changed" }), { status: 401, headers });
				return new Response(JSON.stringify({ code: "service_unavailable" }), { status: 503, headers });
			}
		}),
	});
}

page_route("/page/status", status_body, false, async (ctx, actor, body, _token, canWrite) =>
	ctx.runQuery(internal.gmail_accounts.status, {
		...actor,
		canWrite,
		paginationOpts: { numItems: 25, cursor: body.cursor ?? null },
	}),
);
page_route("/page/connect/start", start_body, true, gmail_start);
page_route("/page/connect/finish", finish_body, true, gmail_finish);
page_route("/page/connect/cancel", cancel_body, true, async (ctx, actor, body) => {
	const result = await ctx.runMutation(internal.gmail_oauth.cancel, { ...actor, ...body });
	if ("_nay" in result) throw new gmail_PageError(result._nay.status, result._nay.code);
	return { cancelled: true };
});
page_route("/page/press-repair", repair_body, true, gmail_repair);
page_route("/page/disconnect", account_body, true, async (ctx, actor, body) => {
	const result = await ctx.runMutation(internal.gmail_accounts.disconnect, { ...actor, ...body });
	if ("_nay" in result) throw new gmail_PageError(result._nay.status, result._nay.code);
	return result._yay;
});
page_route("/page/retry-sync", account_body, true, async (ctx, actor, body) => {
	const result = await ctx.runMutation(internal.gmail_accounts.retry_sync, { ...actor, ...body });
	if ("_nay" in result) throw new gmail_PageError(result._nay.status, result._nay.code);
	return { retrying: true };
});
page_route("/page/retry-failed", account_body, true, async (ctx, actor, body) => {
	const result = await ctx.runMutation(internal.gmail_accounts.retry_failed, { ...actor, ...body });
	if ("_nay" in result) throw new gmail_PageError(result._nay.status, result._nay.code);
	return result._yay;
});
page_route("/page/failures", failures_body, false, async (ctx, actor, body) => {
	const result = await ctx.runQuery(internal.gmail_accounts.failures, {
		...actor,
		accountId: body.accountId,
		paginationOpts: { numItems: 25, cursor: body.cursor ?? null },
	});
	if ("_nay" in result) throw new gmail_PageError(result._nay.status, result._nay.code);
	return result._yay;
});

function escape_html(value: string) {
	return value.replace(
		/[&<>"']/g,
		(character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!,
	);
}

http.route({
	path: "/oauth/google/callback",
	method: "GET",
	handler: httpAction(async (ctx, request) => {
		const nonce = crypto.randomUUID();
		const headers = {
			"Content-Type": "text/html; charset=utf-8",
			"Cache-Control": "no-store",
			"Referrer-Policy": "no-referrer",
			"X-Content-Type-Options": "nosniff",
			"Content-Security-Policy": `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
		};
		let content: string;
		let status = 200;
		try {
			const url = new URL(request.url);
			const state = url.searchParams.get("state");
			const code = url.searchParams.get("code");
			const denial = url.searchParams.get("error");
			if (
				!state ||
				!secret.safeParse(state).success ||
				(!code && !denial) ||
				(code && denial) ||
				(code?.length ?? 0) > 8192 ||
				(denial?.length ?? 0) > 100
			)
				throw new gmail_PageError(400, "invalid_callback");
			const result = await gmail_callback(ctx, state, code, !!denial);
			content =
				result.status === "finished"
					? "<p>Gmail is connected. You can close this tab.</p>"
					: result.finishCode
						? `<p>Google confirmed ${escape_html(result.emailAddress ?? "")}.</p><p>Organization ID: <code>${escape_html(result.organizationId)}</code><br>Workspace ID: <code>${escape_html(result.workspaceId)}</code></p><p>Compare these IDs with the Gmail card in Press. Emails and attachments will be ordinary workspace Files. Other members with file access can read them.</p><label for="finish">Finish code</label><textarea id="finish" readonly rows="3">${escape_html(result.finishCode)}</textarea><button id="copy" type="button">Copy code</button><p id="copied" role="status"></p><p>Copy this code. Return to your original Press page, paste it, and choose Finish connection. The code expires in ten minutes. Do not share it.</p><script nonce="${nonce}">document.getElementById("copy").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(document.getElementById("finish").value);document.getElementById("copied").textContent="Code copied"}catch{document.getElementById("finish").select();document.getElementById("copied").textContent="Select and copy the code above."}});</script>`
						: "<p>Google sign-in is being checked. Reload this page shortly.</p>";
		} catch (error) {
			status = error instanceof gmail_PageError ? error.status : 503;
			const message =
				error instanceof gmail_PageError && error.code === "google_denied"
					? "Gmail was not connected."
					: "Gmail could not be connected. Return to Press, cancel this attempt, and start again.";
			content = `<p>${message}</p>`;
		}
		return new Response(
			`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Connect Gmail</title><style>body{font:16px system-ui;max-width:640px;margin:40px auto;padding:20px;line-height:1.5}textarea{display:block;width:100%;font:16px monospace;box-sizing:border-box}code{overflow-wrap:anywhere}</style></head><body><h1>Connect Gmail</h1>${content}</body></html>`,
			{ status, headers },
		);
	}),
});

export default http;
