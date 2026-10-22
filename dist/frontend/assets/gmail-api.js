import {
  a as e,
  c as t,
  i as n,
  n as r,
  o as i,
  r as a,
  s as o,
  t as s,
} from "./zod.js";
var c = o().min(1).max(128),
  l = e().finite().nonnegative().nullable(),
  u = e().int().nonnegative(),
  d = i({
    organizationId: c,
    workspaceId: c,
    installationId: c,
    actorUserId: c,
  }),
  f = i({
    binding: d,
    clientRequestId: o().regex(/^[0-9a-f]{64}$/),
    accountId: c.nullable(),
    attemptId: c.nullable(),
    purpose: s([`connect`, `compose`]),
  }),
  p = s([
    `preparing`,
    `pending`,
    `exchanging`,
    `awaiting_finish`,
    `finished`,
    `failed`,
    `cancelled`,
  ]),
  m = i({
    attemptId: c,
    status: p,
    consentUrl: t()
      .refine((e) => new URL(e).origin === `https://accounts.google.com`)
      .optional(),
  }),
  h = i({
    binding: d,
    canWrite: a(),
    cursor: o().nullable(),
    attempt: i({
      attemptId: c,
      status: p,
      expiresAt: e().finite().positive(),
      clientRequestId: o().regex(/^[0-9a-f]{64}$/),
      accountId: c.nullable(),
      purpose: s([`connect`, `compose`]),
    }).nullable(),
    accounts: r(
      i({
        accountId: c,
        emailAddress: n(),
        destinationPath: o().min(1),
        connectionGeneration: e().int().positive(),
        syncStatus: s([
          `backfilling`,
          `live`,
          `blocked`,
          `error`,
          `disconnected`,
        ]),
        syncError: o().nullable(),
        sourceError: s([
          `google_revoked`,
          `gmail_request`,
          `history_response_too_large`,
        ]).nullable(),
        pressReady: a(),
        canRepair: a(),
        needsReconnect: a(),
        isComposer: a(),
        canCompose: a(),
        backfillComplete: a(),
        messagesSynced: u,
        messagesSkipped: u,
        ledgerCounts: i({
          pending: u,
          done: u,
          skipped: u,
          failed: u,
          given_up: u,
          emailAssumed: u,
          permissionHeld: u,
        }),
        attachmentsSkippedReason: s([`plan`, `storage`]).nullable(),
        nextSyncAt: l,
        nextPermissionRetryAt: l,
        lastSyncedAt: l,
        newestEmailAt: l,
      }),
    ).max(25),
  }),
  g = i({
    items: r(
      i({ gmailMessageId: o().regex(/^[0-9a-f]+$/), reasonCode: o() }),
    ).max(25),
    cursor: o().nullable(),
  }),
  _ = `https://kindhearted-mallard-511.convex.site`,
  v = i({ code: o() }),
  y = class extends Error {
    code;
    constructor(e) {
      (super(e), (this.code = e));
    }
  },
  b = {
    press_access_changed: `Bonobo Senate access changed. Reopen the page to resume.`,
    page_write_refused: `You need write access to change this connection.`,
    account_capacity: `This service has reached its connection limit. Ask the operator to check hosting capacity.`,
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
function x() {
  return [...crypto.getRandomValues(new Uint8Array(32))]
    .map((e) => e.toString(16).padStart(2, `0`))
    .join(``);
}
function S(e) {
  return e instanceof y
    ? (b[e.code] ??
        `Gmail service is unavailable. Retry or ask the operator to check Convex.`)
    : `Gmail service is unavailable. Retry or ask the operator to check Convex.`;
}
async function C(e, t, n, r, i = 2e4) {
  let a = await e.getToken();
  for (let o = 0; o < 2; o++) {
    let s = await fetch(`${_}${t}`, {
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
      let e = v.safeParse(c);
      throw new y(e.success ? e.data.code : `service_unavailable`);
    }
    let l = r.safeParse(c);
    if (!l.success) throw new y(`service_unavailable`);
    return l.data;
  }
  throw new y(`press_access_changed`);
}
function w(e, t) {
  return e === null ? `unchecked` : t - e > 12e5 ? `delayed` : `recent`;
}
export {
  x as a,
  m as c,
  g as i,
  h as l,
  w as n,
  C as o,
  S as r,
  f as s,
  y as t,
};
