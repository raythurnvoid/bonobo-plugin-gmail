# Gmail

Gmail is a Press plugin with its own Convex backend. It saves received and sent mail as Markdown files. Attachments are saved beside each email. Press owns Files, permissions, billing, and installation.

The build follows plan v4. Version 0.2.3 includes the connection page and background sync. Live Gmail and hosting checks are still open. The integration is not release ready yet.

The frontend build keeps the page, React, and Zod in separate files. Each file is formatted and listed in the manifest with its hash. This lets the publisher read the page code within its scan limit.

## Setup

Use Node 24.16.0 through Vite Plus and pnpm. Run commands with `vp env exec`.

- `vp env exec pnpm install`
- `vp env exec pnpm run typecheck`
- `vp env exec pnpm run lint`
- `vp env exec pnpm run test:once`
- `vp env exec pnpm run build`

The dev backend is `kindhearted-mallard-511`. Its callback is `https://kindhearted-mallard-511.convex.site/oauth/google/callback`.

## Environment

Set these on the plugin backend. Never commit them or put them on Press.

- `PRESS_HTTP_URL`: the Press HTTP origin.
- `PRESS_GMAIL_SERVICE_SECRET`: the plugin service proof from Press registration.
- `GMAIL_PLUGIN_ENCRYPTION_KEY`: one base64 key with 32 random bytes. Keep it when redeploying.
- `GMAIL_OAUTH_CLIENT_ID` and `GMAIL_OAUTH_CLIENT_SECRET`: the Google web client.
- `GMAIL_MAX_CONNECTED_ACCOUNTS`: the atomic connection cap; dev starts at 1.
- `DEV_PLUGIN_ORIGIN`: optional exact dev origin, such as `http://localhost:5173`. Do not include a path or trailing slash.

Google uses only the Gmail read-only scope. Connecting requires Google consent and an authenticated Finish step on the original Press page. Disconnect clears saved Gmail access and keeps Files. Disconnect before uninstalling.

## Google configuration

Create a Google Cloud project and enable the Gmail API. Configure Google Auth Platform with an External audience. Set the app name and support contact, then add only `https://www.googleapis.com/auth/gmail.readonly` in Data Access. In Testing, add the account used for the dev connection as a test user.

Create a Web application OAuth client. Its only redirect URI is `https://<plugin-deployment>.convex.site/oauth/google/callback`. Use the plugin backend deployment, not the Press deployment. The server handles consent, token exchange, and background reads. No separate Clerk or Polar project is needed.

Download the newly issued client JSON. Save its client ID and client secret in the ignored `.env.local` as `GMAIL_OAUTH_CLIENT_ID` and `GMAIL_OAUTH_CLIENT_SECRET`. Set the same two keys on the plugin Convex deployment. Use file or stdin input to keep secret values out of shell history. Do not commit the JSON, `.env.local`, account addresses, or private setup notes.

After the real connection works, move the OAuth audience to Production as specified by the hosting plan. The app can still require Google's unverified-app consent step. Public verification is a separate release task. Record the private project and client details outside tracked files.

See Google's [consent setup](https://developers.google.com/workspace/guides/configure-oauth-consent) and [server authorization guide](https://developers.google.com/workspace/gmail/api/auth/web-server).

The public home and privacy pages are in `docs/`. GitHub Pages serves them from `main` at `/docs`. Set the app home URL to `https://raythurnvoid.github.io/bonobo-plugin-gmail/` and the privacy URL to `https://raythurnvoid.github.io/bonobo-plugin-gmail/privacy.html`. Keep account contacts and client values in Google configuration and local private notes.

Start saves one attempt per member and installation. Exact retries recover the same consent link. Google callback stages access and shows a finish code for ten minutes. It shows the verified organization and workspace IDs so the member can compare them with Press. Status never reveals this code, the staged address, or tokens. Finish checks the original member, current write access, and the attempt's own Press grant. Callback alone cannot start sync.

The account occupies its slot before the first seal completes. No source work starts until the grant is ready. Finish receipt retries work for 24 hours with fresh page auth. Disconnect or a newer connection makes an old receipt unusable. Cancel, failure, and expiry clear staged secrets. The Google OAuth client must be configured before Start; other backend checks can run before that user setup step.

## Files and source limits

Email paths use UTC: `/emails/<saved-address-slug>/<year>/<month>/<day>-<subject>-<full-message-id>.md`. Headers use YAML frontmatter. Search uses keys such as `frontmatter.gmail-thread-id:<id>` and `frontmatter.direction:sent`.

The parser prefers plain text. It uses HTML as text when no plain body exists. Attached messages do not become the email body. Inline images with Content-ID are skipped. Other attachments keep their order. Only the first 16 are planned for saving. Attachment names cannot become AGENTS, README, or SKILL files.

Limits: 48 MiB of streamed source JSON, 32 MiB per decoded attachment, 2 MiB of selected body bytes, 8 body parts, 60 seconds for body loading, 4,096 MIME parts, and depth 32. Complete Markdown is capped at 800,000 UTF-8 bytes. Header and recipient limits keep search data small. Planned attachment names in the email do not prove later upload success.

Text bodies use decoded bytes for size limits. Gmail can report a text size that differs from the actual bytes. Attachments still need an exact size match before upload.

Current Press attachment billing is one cent per started 20 MiB. A 32 MiB attachment uses two cents. The upload plan must also allow Files uploads. A new plan or storage refusal skips that email's new attachments. The next email checks again. Existing pending receipts remain available for finalize-only recovery if create or remint is refused. Never replace a refused receipt or delete its placeholder to avoid the check.

Plan/storage skips now save their attachment count and final message together. The account note saves in that same transaction. A successful new-target create clears the old note with its accepted receipt. Local tests stop at both saves, then run completion and new dispatch. Refused mail stays complete; later mail uploads each attachment once. Stale permission claims cannot change the note. The broken save rules fail their named checks. Deploy and verify this change after the current idle measurement.

Local stops also cover plan/storage refusals on accepted create replay and remint. The saved request, note, minute wait and pending count survive completion and new dispatch. The fifth pending reply needs Retry; Retry checks the same receipt first. New mail uses its own upload keys after the refusal is lifted. Nine broken rules fail their named checks. Providers are fake; hosted recovery remains open.

Two mixed-message checks stop after accepting two uploads and refusing a third new target. The accepted tasks stay unchanged and settle with separate keys, different bytes and one PUT each. The new target stays skipped. Partial and final settlement save the message due time too. Later mail uses new keys and clears the note. Seven broken save rules fail their named checks. These are local checks with fake providers.

## Sync and recovery

Status lists accounts through an exact organization/workspace/email index, in pages of 25. It reads saved counters instead of walking the message ledger.

A minute dispatcher queues one slice per account. One Workpool runs with parallelism 1 and five crash attempts. Each source or save slice starts at most 25 complete steps in 40 seconds. A started step finishes its preparation, one attachment delivery, and checkpoint before yielding. It can cross the time limit. Calls have finite timeouts. Each Press Files route is paced at least 0.6 seconds apart per installation.

Normal history and file work share that one queue slot. The dispatcher saves one request/work pair before another slice can start. Workpool cancellation keeps an already running attempt alive, so late replies still need the saved generation, request and grant checks. Recovery checks the scheduled job's terminal state before retrying; elapsed time alone does not free its slot. Hosted scheduler and nested-action faults still need live evidence.

Backfill, history, and due retries take turns from the start. A fresh profile baseline is saved before listing. Backfill stores at most 25 IDs and its position. History stores only a cursor and event anchor; batches contain at most 25 events. A completed history page owns durable queue entries before its cursor moves. Only a completed final history page changes the last-check time. History JSON is limited to 16 MiB; an oversized page retries with one record, then stops visibly if needed.

The ledger keeps file and attachment progress separately. Email writes use the saved path and `overwrite: fail`. An exact existing-path conflict assumes the email exists and still handles attachments. A lost write reply followed by a member move can create a second email copy. The plugin cannot prove who created a colliding path. This is an accepted v1 limit.

Attachment requests are frozen before create. Accepted or uncertain targets finalize before Google reads. A pending create without a PUT marker recovers transport and sends the whole file. PUT markers and delivery counts are saved first. Pending checks wait one minute; replacement delivery waits at least three minutes. Five deliveries or five source-free pending checks require Retry failed emails. Receipts stay. Reinstall may need a new suffix path; an old accepted upload may later produce a second copy.

A Files refusal with valid member and grant authority holds only that message. Ordinary and held retries use separate indexes. The oldest held unit claims one account-wide hour before any effect. Matching successful email or upload write proof may release it early. A collision, released target, source read, or unrelated save cannot do so. Other folders and new mail still get their normal attempts. Repair and Reconnect keep the holds, count, and clock.

Google source errors stop source reads but leave indexed attachment settlement available. Invalid Google access clears that saved token and needs Reconnect. Request or history-size errors offer Retry sync. Credits wait an hour; shared outages save account backoff without spending message attempts. A replay of the same work waits for that saved account time. Failed completion keeps the longer saved wait, including validated rate-limit delays. Source-stopped accounts still have no due time without settlement work. Disconnect, replaced grants, and newer work requests stop later effects and stale lifecycle saves.

The page polls every five seconds only while visible. Its last-check label comes from the saved completed history time. Ten minutes without a check shows delayed. Files attention stays visible even beside a recent mail check. The page keeps tokens and finish codes in memory, and stores only bound Start retry IDs in session storage. Failure lists show message IDs and fixed reasons, not private subject paths or attachment names.

The public upload routes are typed locally in `convex/press.ts` because the pinned SDK does not list them. Replies are runtime-validated. Press source and its SDK generator remain unchanged.

The small address parser follows [email-addresses](https://github.com/jackbearheart/email-addresses). HTML entities use [he](https://github.com/mathiasbynens/he), as in the Zero MIME reference.

## Access and updates

The plugin keeps a separate page grant cache and one grant chain per account. Page reads use a one-minute live-check window and a fixed 30-minute ceiling. Changes need a fresh Press write check. Saved secrets use AES-GCM with a purpose, so ciphertext cannot move between accounts or grant rows.

The service account needs workspace Can write. The member also needs write access. Restricted folders need their own grants. A processing token is sealed to the saved account destination. The trusted backend also holds interactive grants, which can seal other writable workspace paths.

After a plugin update, each connecting member must reopen the new page to repair Press access. A reinstall needs Gmail Reconnect for old active rows. Local Disconnect keeps the account ledger and Files. There is no uninstall callback and no age-based token deletion.

Repair needs the same member and installation. It replaces the Press chain, stops the old queued slice, and keeps the account generation, traversals, receipts, and Files access holds. Another member or a new installation needs Google Reconnect. Reconnect also keeps the saved destination and progress, but resets mail traversals for a fresh baseline after sealing. Neither member verification nor repair clears a Files access hold.

Use Disconnect before uninstall, even for paused accounts. If uninstall was missed, reinstall in the same workspace and use writer-authorized Disconnect without Google consent. A private operator can use `gmail_accounts:operator_account_summary`, check the single account's IDs and generation, then call `gmail_accounts:operator_disconnect` with that exact account and generation. Check its returned secret/work/ledger flags and read the summary again. Never bulk-disconnect paused accounts. Already accepted writes may finish; later work must pass the new generation check.

Local Disconnect and Cancel never revoke Google access. Removing this app in Google Account Security affects every mailbox connection under its Google project and requires Reconnect. No public admin HTTP route exists.

## Release checks

Code completion and release readiness are separate. Release needs all plan tests, guard-removal proofs, installed-frame Playwriter checks, and a real 24-hour hosting measurement. The Free byte-limit gap remains open. No capacity claim is made yet.

Local tests prove full status pages despite more than one page of other accounts. Connection tests cover another writer reconnecting the account, clearing older pending/staged attempts, and refusing an older Google reply. These checks failed when their rules were broken and passed after restoration. Upload checks keep plan/storage refusals through repeated pending replies, then allow new mail to upload after the refusal is lifted. Disconnect during PUT keeps its saved receipt and stops later finalize calls. The current dev idle measurement still uses the earlier backend. Deploy and verify the status index and upload retry fix after that measurement ends.

Lost write/create reply tests also run completion and the minute dispatcher. They wait for account backoff, use a new work request, keep frozen paths/keys and send one PUT. Late old completion cannot clear the new request. These are local reply-loss checks, not a live process crash or a complete audit of every checkpoint.

Two local stop tests cover the saved Press call time. A fresh email write and an accepted upload with revoked Gmail access stop after reserving the next call, before any Files request. The saved time stays 600 ms after the prior reservation. Failed completion keeps the message and receipt. New dispatch resumes after backoff, with one email write and PUT or only the same receipt's finalize. Replay makes no extra calls. Removing the timing gap fails both saved-time checks; restoration passes. Hosted recovery remains open.

Four local tests stop before or after the worker claims a Files access retry. The worker first saves a hold after a fake 403 reply. The upload cases also save their receipt and record a fake Google token revocation. A stop before the claim keeps the old due time; a stop after it keeps the new hour on both account and message. Completion and new dispatch preserve those times. Early work makes no message, Files or upload call. Restored access finishes once, with one PUT in total; revoked-source recovery only finalizes its saved receipt. Breaking each saved time fails its own checks; restoration passes. These are local worker tests. Hosted stops and retry cost remain open.

Twelve local stops cover saving successful email, pending-create and finalize replies, including revoked-source finalize. Stops before the save keep the claimed hour. Stops after matching proof clear the hold/count/clock together. A successful email save now makes unfinished work due immediately, so a stop does not leave its attachment waiting for the old hour. A successful pending-create save also moves the message from failed to pending, with its counters and due time. The old code fails these saved-time and status checks. A pending finalize proof keeps the task's minute wait. With revoked Gmail access, it saves one pending check and keeps the Google error. Losing an email reply still needs exact collision recovery; that collision alone keeps the account clock. Recovery keeps frozen receipt keys, makes one email save and one PUT in total, and replay changes nothing. Broken due-time, status, counter, Google-error and clock-release rules fail their named checks; restoration passes. This is local recovery evidence. Deploy and check the fixes after the idle report.

Four more local stops cover proof that finishes held work as needs Retry or skipped. Earlier worker slices produce four pending checks or a spam result, then another Files refusal. A stop before proof saves keeps the claimed hour. A stop after it keeps the final status, reason, counters and receipt, with no due time or automatic settlement. Completion preserves that result. Retry resets the unconfirmed receipt and only finalizes; it leaves skipped mail alone. The full flow writes the email and uploads once. Four broken rules fail their named checks; restoration passes. Providers are fake; hosted recovery remains open.

Two local stops cover reinstall transfer before create. The worker first saves an email, upload receipt, PUT and Files refusal. Mock OAuth Start, callback, Finish and grant sealing switch the installation and cancel the old grant. They keep the whole held message. The next worker stops before or after saving its replacement target. Both keep the claimed hour and make no Files call until it ends. Recovery uses the new installation, next suffix and same saved replacement fields, with one replacement PUT. Old completion cannot clear new work; final replay makes no calls. Breaking the installation, suffix, PUT marker or account clock fails its named check; restoration passes. Real pending-upload reinstall and hosted recovery remain open.

Two more local stops cover lost source after that mock reinstall. A rejected Google token saves revocation while keeping the held message. The next worker keeps the full old receipt and PUT marker as unconfirmed, with needs Retry and no automatic due or settlement work. Giving up clears the message's hold, but keeps the account's claimed hour because no write succeeded. Completion, new dispatch and late old completion preserve the result. Retry resets counters and still makes no Files or upload call without source. The full flow writes the email and uploads once. Five broken rules fail their named checks; restoration passes. These are fake-provider checks; live reinstall and hosted faults remain open.

Six local stop tests keep credits, rate-limit and outage waits through failed completion, with ready or revoked Google access. The same receipt settles after new dispatch, with one email write, create and PUT in total. Breaking the saved-wait and settlement-only rules fails their named checks. The 25 MB byte/memory check now has its own test file. It keeps the 512 MiB limit and avoids measuring earlier worker fixtures. Hosted memory and recovery still need live evidence. Deploy after the idle end report.

Local stop tests also cover the frozen request, accepted create and saved PUT marker. Recovery first checks the same receipt. Without a PUT marker, it sends the exact create fields and makes one first PUT. A saved marker keeps the three-minute wait before getting a fresh upload link and sending once. Each test uses completion and newly dispatched work. Removing each recovery rule fails its named check; restoring it passes. Live verification remains open.

Email stop tests keep the saved path even when a later mock subject changes. The full stop/retry flow makes one email-write call. A stop after the final message save replays backfill without new Google or Files calls or changed message counts. These local tests also fail with their recovery checks removed, then pass after restoration.

Local backfill stop tests keep the history baseline, fetched page and discovered message. Recovery makes one profile call, one list call and one email write in total. The same account/message key keeps one record, and the next page token stays saved. Each reuse check fails when removed and passes after restoration.

History stop tests now interrupt the worker after a saved event batch, page or final cursor. Completion and dispatch recover 21 emails and 16 deletions with one record per message. Saved deletion times stay unchanged. An add/delete pair at the batch edge checks that replay uses the saved message ID and event kind. Each email is read and written once. Only the final cursor save records the completed-history time. Nine broken rules fail their named checks; restored runs pass three cases. These use fake providers and do not prove hosted process stops.

Four more history tests stop after missing-anchor recovery, page-token rejection or expired-history reset. The worker first creates the pending upload and traversal being recovered. Completion and dispatch keep the same receipt, saved email and deletion records. Expired history restarts backfill at page one. Each full flow makes one email write, one create and one PUT. Eight broken rules reach their named assertions; restored runs pass. These local checks use fake providers. Hosted recovery remains open.

A streamed history test stops after the saved page-size reduction and the later size error. Both oversized reads are cancelled. The cursor, backfill and pending receipt stay saved. Settlement uses the same receipt without Google reads, then automatic work stops. Explicit Retry sync keeps page size one and finishes from the saved cursor. Nine broken rules reach their named assertions; restoration passes. This local test does not prove hosted memory or workload cost.

A content failure now saves the count of attachments that were not saved. Local stop tests keep that count, the saved email and final status after an attachment byte-count error. Backfill resumes with no new calls or message changes. Two real write failures save a future retry time; backfill and repeated history work make no early message or write calls. The due retry uses the saved path and finishes once. Removing the named save and recovery checks fails these tests; restoring them passes. Providers are fake, and hosted checks remain open.

The last resolved attachment and its message status now save together. A stopped worker could previously leave a saved attachment on a pending message that could not finish after Google access stopped. Local tests stop after committed create/finalize saves, then record revocation and run completion/dispatch. They keep the message complete with no new calls. Deploy and verify this fix after the current idle measurement.

Eight local stop tests cover accepted targets that return released, missing, cancelled or expired. Each starts with a saved email and one pending upload. Ready and revoked Google access both keep the final skip, frozen keys, count and null due time through replay and completion. Retry leaves the final skip alone. Eight broken rules reach their named checks; restored tests pass. These fake replies do not prove a real member move, archive or cancel. Live checks remain open.

Five more stop cases cover released conflicts during accepted create replay or remint, and released state after the first PUT. Each save keeps the original keys, email, final skip/count and null due time. Replay, completion, new dispatch and Retry leave that whole message unchanged. Create replay sends no PUT; the other paths send once. Three existing refusal tests keep unrelated conflicts unfinished. Nine broken rules reach their named checks; all eight restored cases pass. Providers are fake; real cancel/archive and hosted stops remain open.

An unconfirmed attachment now saves with its message's needs-Retry status too. The local stop test runs five pending checks through completion and dispatch. No automatic work follows the fifth result. Explicit Retry keeps the same receipt and finishes with one finalize call, without Google, create or PUT calls. Live verification remains open.

Three more stop cases cover empty/oversized new attachments and five uploads with fake replies. Final skips keep their count and saved email; Retry leaves them alone. A pending recheck after five deliveries saves needs-Retry with the same receipt. No sixth PUT follows; explicit Retry resets the count and finalizes first. Eight broken rules reach named checks; restored tests pass. Hosted faults and other size stops remain open.

Four size-limit stop cases cover new targets and accepted uploads. Streamed replies above 48 MiB cancel before parsing, despite a false Content-Length. A reply with 44 MiB of base64 exceeds the 32 MiB decoded limit even when its reported size is small. New targets keep their final skip. Accepted uploads keep the same receipt through five pending checks, then wait for Retry. Retry finalizes first without another source fetch or upload. Eleven broken rules reach named checks in each case's JSON report; restored tests pass. Providers are fake; hosted faults and memory checks remain open.

The worker releases used body strings and unused attachment strings before the next fetch. Later attachment slices discard the saved body's source strings. One reference test failed before this change and now delivers two distinct attachments in separate slices without another body fetch. Five body-limit stops keep the saved notice and resume the attachment: too many parts, declared or actual total bytes, total fetch time, and streamed reply size. Twelve broken rules reach named JSON checks; restored tests pass. The clock and providers are fake. These checks do not prove hosted timeouts, peak memory or queue timing. Deploy and verify after the idle end report.

Header and filename parsing now cuts raw text before conversion. Body charset extraction uses at most 8 KiB of Content-Type. Attachment display names have a 512-byte input cap before encoded-word decoding, plus the output cap. The text limiter encodes only a bounded prefix. Local checks cover scalar and address input limits and Unicode cuts. Five removed guards fail named checks; restoration passes. These synthetic inputs do not prove live mailbox behavior or hosted memory. Deploy and verify after the idle end report.

Local transport tests run `gmail_google_get` with Node fetch and a local HTTP server. Both delayed headers and a slow JSON body reject at the supplied deadline. Removing the timeout signal or replacing that deadline with the default fails both named checks; restored tests pass. Every local server closes. These tests use a shorter deadline. Hosted checks remain open.

A worker test spends 59.7 seconds on a test clock, then reads a slow body with native Node fetch and the last 300 ms. Normal backfill creates the message. The timeout sends the time-limit notice and drops partial text. Email progress and one attachment finish; replay sends no extra write or upload. Five removed rules fail named checks; restored tests pass. Google and Press replies are fake, apart from one local streamed response. The test calls the worker directly. Hosted checks remain open.

The same body test also runs with the real clock and native fetch for every body read. Three local streams each wait 19.8 seconds. The fourth gets less than one second and stops at the total minute deadline. The worker saves the time notice, drops partial text and finishes one attachment. Replay leaves the saved message alone. Removing the remaining-time limit or native timeout handler fails its named check; restoration passes. Google metadata and Press replies are fake. This proves the local full body deadline; hosted deadlines, large-byte workloads and queue timing remain open.

A second worker test keeps the real clock for a native PUT. A local server receives the four expected bytes, then waits for a reply. The actual 60-second timeout stops the request. The saved delivery marker and receipt survive; the worker finalizes after the timeout. Early replay leaves the message alone. A later pending-target check commits the same receipt without another source read, email write or PUT. Removing the timeout, delivery marker or post-timeout finalize fails its named check; restoration passes. Google and Press replies are fake. This proves the local upload deadline and recovery; hosted uploads, large-byte workloads and queue timing remain open.

A native attachment test reads a chunked 49 MiB JSON reply with no Content-Length. It stops within one read chunk above 48 MiB and cancels before JSON parsing or attachment decoding. The email stays saved; its attachment keeps `too_large`, with no upload call. Replay leaves the saved message alone. Removing the byte limit, cancellation or attachment outcome fails a named check; restoration passes.

A second native size case reads 44 MiB of base64, which represents a 33 MiB attachment. Its JSON fits the wire cap. Even with reported size 4, the worker refuses it before allocating the decoded buffer, keeps the email and makes no upload call. Removing the estimated-size guard fails the allocation check. The assertion reports a count so a failure cannot print the huge fixture.

The normal 25 MB test now uses native fetch for both download and PUT. A local server produces the JSON in small chunks and hashes the uploaded bytes as they arrive. It gets all 25 million bytes with the expected SHA-256 hash, PUT method and content type. The receipt and delivery marker are saved before PUT. A fake committed reply finishes the same receipt; replay sends no extra source read, write or upload. Sending fewer bytes or changing one byte fails the corresponding check. Restored tests pass.

These tests check the process memory peak reported by Node's [resourceUsage API](https://nodejs.org/download/release/v24.16.0/docs/api/process.html#processresourceusage). Each stays below 512 MiB, including the test runner and local server. Size-case reads and cancellation are observed without changing their bytes; the reader factory returns that same native reader. The 25 MB test uses the native responses directly. Other Google and Press replies are fake; the worker is called directly. Accepted-target native size recovery, hosted memory and saves, and queue timing remain open.

Every task save now also saves the message status and retry time. A stopped pending reply previously left the message due too early. Local tests retry the same work request before the saved time, keep its receipt and counters, then resume new dispatched work. There is one create, one PUT and one email write in total. The tests cover available source and recorded revocation with fake providers. Removing the save, wait or counter rules fails their named checks; restoration passes. Live verification remains open.

The first saved recovery-pending reply now keeps a future task time too. When source is already unavailable, that save also records the pending check and message status. Local tests stop after each of five replies. The fifth requires Retry and keeps the same receipt. Retry resets its counters and finalizes once. Four removed rules fail their named checks; restored checks pass. A second unstarted attachment pauses after recorded revocation, so the message waits for its pending receipt. Once that receipt commits, the source-only part still needs Reconnect. These checks use fake providers. Deploy and verify them after the idle end report.

New source loss now saves its skip or error fields with the pending check and skipped parts. Local stops cover Gmail 404, spam, trash, draft, oversized JSON, too many MIME parts and an invalid message. The saved receipt still finalizes without reading that message again. With no receipt, the first source-loss save has a final status. Four removed rules fail their named checks; restoration passes ten cases. These tests use fake providers and do not close hosted recovery checks.

Missing body or attachment bytes now finish only that message's source work. A 404 after MIME metadata saves its deletion reason/time, skipped count and receipt due time together. Accepted uploads keep their keys and still finalize; later mail can sync. Replies with 403 or 503 keep normal account errors or backoff. Two tests failed at the account source-error check before this fix. Eight local cases and eight broken-rule checks now pass. Providers are fake; deploy and verify after the idle end report. See Google's [Gmail error guide](https://developers.google.com/workspace/gmail/api/guides/handle-errors).

Local tests now stop after a rejected token reply following pending finalize. Permanent rejection saves one pending check and pauses unstarted source parts before saving the account error. A temporary outage spends no check and keeps account backoff on replay. Invalid grant clears the saved Google token; request errors keep it. Stops before and after the account error keep the same receipt and allow one later committed finalize. Breaking these rules fails five named checks; restoration passes six cases, including a Press outage. Providers are fake. Deploy and verify these changes after the idle end report.

The installed dev frame has passed status, update, narrow-layout, and simulated unavailable/hidden-page checks. Google client settings are saved on the plugin backend. Real read-only consent, Finish, waiting-page reloads and Reconnect passed. Files search found a saved email. A Gmail-web self-send saved the expected body and sent direction. Its attachment matched the original bytes and SHA-256 hash. A Press agent read that file with a successful stored Bash result. Remaining live access and recovery checks are open. Local fixtures cover receipt isolation, crash checkpoints, long backfill with parallel history, and access holds. Recovery tests also cover offline spam/trash rescue after history expiry, a rescue moved back to trash, sent draft IDs, reinstall filename conflicts, and failed refresh after returning visible. They do not replace mailbox or hosted workload checks.

Live checks also passed a refused month save and a removed service-account workspace grant. The member kept write access. Restoring the month did not change its saved retry time; the normal retry later saved that email and cleared only its hold. The service-account grant was restored to its original level. Update recovered through Press-only repair. Named-account operator Disconnect cleared local secrets and work while keeping the ledger. Native uninstall, install with the same service account, and Google Reconnect kept the account, destination, saved files, and both hold times.

Playwriter enables focus emulation, which makes background tabs report visible. For a real hidden-page check, turn off `Emulation.setFocusEmulationEnabled` on the owned page's CDP session. Check the host and plugin frame both report hidden before counting requests. The installed page made zero status calls while hidden. Restore the harness setting after the check. Do not treat background tab selection alone as proof.

The dev cap is 1. Monthly disable limits are 400,000 calls and 4 GB-hours for each action runtime. The required fractional byte limits could not be saved on the Free dashboard. Do not raise those limits or the account cap as a workaround. Keep release open until the required limits and measured shared-team budget fit plan v4. Work-alone checks are self-review; independent review has not run.
