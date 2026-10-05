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

## Sync and recovery

Status lists accounts through an exact organization/workspace/email index, in pages of 25. It reads saved counters instead of walking the message ledger.

A minute dispatcher queues one slice per account. One Workpool runs with parallelism 1 and five crash attempts. Each source or save slice starts at most 25 complete steps in 40 seconds. A started step finishes its preparation, one attachment delivery, and checkpoint before yielding. It can cross the time limit. Calls have finite timeouts. Each Press Files route is paced at least 0.6 seconds apart per installation.

Backfill, history, and due retries take turns from the start. A fresh profile baseline is saved before listing. Backfill stores at most 25 IDs and its position. History stores only a cursor and event anchor; batches contain at most 25 events. A completed history page owns durable queue entries before its cursor moves. Only a completed final history page changes the last-check time. History JSON is limited to 16 MiB; an oversized page retries with one record, then stops visibly if needed.

The ledger keeps file and attachment progress separately. Email writes use the saved path and `overwrite: fail`. An exact existing-path conflict assumes the email exists and still handles attachments. A lost write reply followed by a member move can create a second email copy. The plugin cannot prove who created a colliding path. This is an accepted v1 limit.

Attachment requests are frozen before create. Accepted or uncertain targets finalize before Google reads. A pending create without a PUT marker recovers transport and sends the whole file. PUT markers and delivery counts are saved first. Pending checks wait one minute; replacement delivery waits at least three minutes. Five deliveries or five source-free pending checks require Retry failed emails. Receipts stay. Reinstall may need a new suffix path; an old accepted upload may later produce a second copy.

A Files refusal with valid member and grant authority holds only that message. Ordinary and held retries use separate indexes. The oldest held unit claims one account-wide hour before any effect. Matching successful email or upload write proof may release it early. A collision, released target, source read, or unrelated save cannot do so. Other folders and new mail still get their normal attempts. Repair and Reconnect keep the holds, count, and clock.

Google source errors stop source reads but leave indexed attachment settlement available. Invalid Google access clears that saved token and needs Reconnect. Request or history-size errors offer Retry sync. Credits wait an hour; shared outages save account backoff without spending message attempts. Disconnect, replaced grants, and newer work requests stop later effects and stale lifecycle saves.

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

Local tests prove full status pages despite more than one page of other accounts. They also prove that restart after saving a reinstall target waits for the saved permission time, then resumes the same target. Connection tests cover another writer reconnecting the account, clearing older pending/staged attempts, and refusing an older Google reply. These checks failed when their rules were broken and passed after restoration. Upload checks keep plan/storage refusals through repeated pending replies, then allow new mail to upload after the refusal is lifted. Disconnect during PUT keeps its saved receipt and stops later finalize calls. The current dev idle measurement still uses the earlier backend. Deploy and verify the status index and upload retry fix after that measurement ends.

Lost write/create reply tests also run completion and the minute dispatcher. They wait for account backoff, use a new work request, keep frozen paths/keys and send one PUT. Late old completion cannot clear the new request. These are local reply-loss checks, not a live process crash or a complete audit of every checkpoint.

Local stop tests also cover the frozen request, accepted create and saved PUT marker. Recovery first checks the same receipt. Without a PUT marker, it sends the exact create fields and makes one first PUT. A saved marker keeps the three-minute wait before getting a fresh upload link and sending once. Each test uses completion and newly dispatched work. Removing each recovery rule fails its named check; restoring it passes. Live verification remains open.

Email stop tests keep the saved path even when a later mock subject changes. The full stop/retry flow makes one email-write call. A stop after the final message save replays backfill without new Google or Files calls or changed message counts. These local tests also fail with their recovery checks removed, then pass after restoration.

Local backfill stop tests keep the history baseline, fetched page and discovered message. Recovery makes one profile call, one list call and one email write in total. The same account/message key keeps one record, and the next page token stays saved. Each reuse check fails when removed and passes after restoration.

A content failure now saves the count of attachments that were not saved. Local stop tests keep that count, the saved email and final status after an attachment byte-count error. Backfill resumes with no new calls or message changes. Two real write failures save a future retry time; backfill and repeated history work make no early message or write calls. The due retry uses the saved path and finishes once. Removing the named save and recovery checks fails these tests; restoring them passes. Providers are fake, and hosted checks remain open.

The last resolved attachment and its message status now save together. A stopped worker could previously leave a saved attachment on a pending message that could not finish after Google access stopped. Local tests stop after committed create/finalize saves, then record revocation and run completion/dispatch. They keep the message complete with no new calls. Deploy and verify this fix after the current idle measurement.

An unconfirmed attachment now saves with its message's needs-Retry status too. The local stop test runs five pending checks through completion and dispatch. No automatic work follows the fifth result. Explicit Retry keeps the same receipt and finishes with one finalize call, without Google, create or PUT calls. Live verification remains open.

The installed dev frame has passed status, update, narrow-layout, and simulated unavailable/hidden-page checks. Google client settings are saved on the plugin backend. Real read-only consent, Finish, waiting-page reloads and Reconnect passed. Files search found a saved email. A Gmail-web self-send saved the expected body and sent direction. Its attachment matched the original bytes and SHA-256 hash. A Press agent read that file with a successful stored Bash result. Remaining live access and recovery checks are open. Local fixtures cover receipt isolation, crash checkpoints, long backfill with parallel history, and access holds. Recovery tests also cover offline spam/trash rescue after history expiry, a rescue moved back to trash, sent draft IDs, reinstall filename conflicts, and failed refresh after returning visible. They do not replace mailbox or hosted workload checks.

Live checks also passed a refused month save and a removed service-account workspace grant. The member kept write access. Restoring the month did not change its saved retry time; the normal retry later saved that email and cleared only its hold. The service-account grant was restored to its original level. Update recovered through Press-only repair. Named-account operator Disconnect cleared local secrets and work while keeping the ledger. Native uninstall, install with the same service account, and Google Reconnect kept the account, destination, saved files, and both hold times.

Playwriter enables focus emulation, which makes background tabs report visible. For a real hidden-page check, turn off `Emulation.setFocusEmulationEnabled` on the owned page's CDP session. Check the host and plugin frame both report hidden before counting requests. The installed page made zero status calls while hidden. Restore the harness setting after the check. Do not treat background tab selection alone as proof.

The dev cap is 1. Monthly disable limits are 400,000 calls and 4 GB-hours for each action runtime. The required fractional byte limits could not be saved on the Free dashboard. Do not raise those limits or the account cap as a workaround. Keep release open until the required limits and measured shared-team budget fit plan v4. Work-alone checks are self-review; independent review has not run.
