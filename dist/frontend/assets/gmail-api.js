import {
  a as e,
  c as t,
  i as n,
  l as r,
  n as i,
  o as a,
  r as o,
  s,
  t as c,
} from "./zod.js";
var l = [7, 30, 90, 365],
  u = t().min(1).max(128),
  d = a().finite().nonnegative().nullable(),
  f = a().int().nonnegative(),
  p = s({
    organizationId: u,
    workspaceId: u,
    installationId: u,
    actorUserId: u,
  }),
  m = s({
    binding: p,
    clientRequestId: t().regex(/^[0-9a-f]{64}$/),
    accountId: u.nullable(),
    attemptId: u.nullable(),
    purpose: c([`connect`, `compose`]),
    backfillDays: e(l).nullable(),
  }),
  h = c([
    `preparing`,
    `pending`,
    `exchanging`,
    `awaiting_finish`,
    `finished`,
    `failed`,
    `cancelled`,
  ]),
  g = s({
    attemptId: u,
    status: h,
    consentUrl: r()
      .refine((e) => new URL(e).origin === `https://accounts.google.com`)
      .optional(),
  }),
  _ = s({
    binding: p,
    canWrite: o(),
    cursor: t().nullable(),
    attempt: s({
      attemptId: u,
      status: h,
      expiresAt: a().finite().positive(),
      clientRequestId: t().regex(/^[0-9a-f]{64}$/),
      accountId: u.nullable(),
      purpose: c([`connect`, `compose`]),
      backfillDays: e(l).nullable(),
    }).nullable(),
    backfillMaxDays: e(l).nullable(),
    accounts: i(
      s({
        accountId: u,
        emailAddress: n(),
        destinationPath: t().min(1),
        connectionGeneration: a().int().positive(),
        syncStatus: c([
          `backfilling`,
          `live`,
          `blocked`,
          `error`,
          `disconnected`,
        ]),
        syncError: t().nullable(),
        sourceError: c([
          `google_revoked`,
          `gmail_request`,
          `history_response_too_large`,
        ]).nullable(),
        pressReady: o(),
        canRepair: o(),
        needsReconnect: o(),
        isComposer: o(),
        canCompose: o(),
        backfillComplete: o(),
        messagesSynced: f,
        messagesSkipped: f,
        ledgerCounts: s({
          pending: f,
          done: f,
          skipped: f,
          failed: f,
          given_up: f,
          emailAssumed: f,
          permissionHeld: f,
        }),
        attachmentsSkippedReason: c([`plan`, `storage`]).nullable(),
        nextSyncAt: d,
        nextPermissionRetryAt: d,
        lastSyncedAt: d,
        watchExpiresAt: d,
        newestEmailAt: d,
        backfillAfter: a().int().nonnegative().nullable(),
      }),
    ).max(25),
  }),
  v = s({
    items: i(
      s({ gmailMessageId: t().regex(/^[0-9a-f]+$/), reasonCode: t() }),
    ).max(25),
    cursor: t().nullable(),
  }),
  y = `https://kindhearted-mallard-511.convex.site`,
  b = s({ code: t() }),
  x = class extends Error {
    code;
    constructor(e) {
      (super(e), (this.code = e));
    }
  },
  S = {
    press_access_changed: `Bonobo Senate access changed. Reopen the page to resume.`,
    page_write_refused: `You need write access to change this connection.`,
    account_capacity: `This service has reached its connection limit. Ask the operator to check hosting capacity.`,
    backfill_too_long: `This service saves less old mail now. Reload the page and choose a shorter time.`,
    rate_limited: `Too many requests. Wait a minute and try again.`,
    start_again: `This connection expired or stopped. Start again.`,
    choose_reconnect: `This Gmail account already exists here. Use Reconnect Gmail.`,
    gmail_account_changed: `Use the same Gmail account for Reconnect.`,
    invalid_finish_code: `The finish code is not valid. Copy it from the Google callback page.`,
    connection_changed: `The connection changed. Refresh this page.`,
    google_reconnect_needed: `Use Reconnect Gmail for this account.`,
    attempt_expired: `This connection expired. Start again.`,
    compose_not_granted: `Drafts are off for this account. Open the Gmail page and press Allow drafts and Send.`,
    not_composer: `Only the member who connected this account can write drafts for it.`,
    account_not_found: `This Gmail account is no longer connected here.`,
    draft_gone: `This draft is no longer in Gmail. It was sent or deleted there.`,
    draft_saving: `The draft is still being saved. Try again in a moment.`,
    draft_unreadable: `This draft was changed in Gmail into a form this page cannot edit. Open it in Gmail.`,
    draft_too_large: `A draft can have at most 50 KB of text. Shorten the body.`,
    invalid_recipient: `One of the addresses is not a valid email address. Use name@example.com or Name <name@example.com>.`,
    invalid_header: `The subject or an address has a line break. Remove it.`,
    no_recipient: `Add at least one recipient before you send.`,
    email_not_found: `Gmail no longer has the email this reply answers.`,
    gmail_busy: `Gmail is busy. Try again in a moment.`,
    gmail_refused: `Gmail refused the request. Try again, or check the draft in Gmail.`,
    body_too_large: `This draft is too large to save.`,
  };
function C() {
  return [...crypto.getRandomValues(new Uint8Array(32))]
    .map((e) => e.toString(16).padStart(2, `0`))
    .join(``);
}
function w(e) {
  return e instanceof x
    ? (S[e.code] ??
        `Gmail service is unavailable. Retry or ask the operator to check Convex.`)
    : `Gmail service is unavailable. Retry or ask the operator to check Convex.`;
}
async function T(e, t, n, r, i = 2e4) {
  let a = await e.getToken();
  for (let o = 0; o < 2; o++) {
    let s = await fetch(`${y}${t}`, {
      method: `POST`,
      redirect: `error`,
      headers: {
        Authorization: `Bearer ${a}`,
        "Content-Type": `application/json`,
      },
      body: JSON.stringify(n),
      signal: AbortSignal.timeout(i),
    });
    if (s.status === 401 && o === 0) {
      a = await e.refreshToken();
      continue;
    }
    let c = await s.json();
    if (!s.ok) {
      let e = b.safeParse(c);
      throw new x(e.success ? e.data.code : `service_unavailable`);
    }
    let l = r.safeParse(c);
    if (!l.success) throw new x(`service_unavailable`);
    return l.data;
  }
  throw new x(`press_access_changed`);
}
function E(e, t, n) {
  let r = n !== null && n > t ? 42e5 : 12e5;
  return e === null ? `unchecked` : t - e > r ? `delayed` : `recent`;
}
export {
  C as a,
  g as c,
  v as i,
  _ as l,
  E as n,
  T as o,
  w as r,
  m as s,
  x as t,
  l as u,
};
