# Gmail

Gmail is a Press plugin with its own Convex backend. It saves received and sent mail as Markdown files. Attachments are saved beside each email. Press owns Files, permissions, billing, and installation.

The build follows plan v4. Implementation and live checks are in progress. This version is not ready to publish.

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

Google uses only the Gmail read-only scope. Connecting requires Google consent and an authenticated Finish step on the original Press page. Disconnect clears saved Gmail access and keeps Files. Disconnect before uninstalling.

## Files and source limits

Email paths use UTC: `/emails/<saved-address-slug>/<year>/<month>/<day>-<subject>-<full-message-id>.md`. Headers use YAML frontmatter. Search uses keys such as `frontmatter.gmail-thread-id:<id>` and `frontmatter.direction:sent`.

The parser prefers plain text. It uses HTML as text when no plain body exists. Attached messages do not become the email body. Inline images with Content-ID are skipped. Other attachments keep their order. Only the first 16 are planned for saving. Attachment names cannot become AGENTS, README, or SKILL files.

Limits: 48 MiB of streamed source JSON, 32 MiB per decoded attachment, 2 MiB of selected body bytes, 8 body parts, 60 seconds for body loading, 4,096 MIME parts, and depth 32. Complete Markdown is capped at 800,000 UTF-8 bytes. Header and recipient limits keep search data small. Planned attachment names in the email do not prove later upload success.

The small address parser follows [email-addresses](https://github.com/jackbearheart/email-addresses). HTML entities use [he](https://github.com/mathiasbynens/he), as in the Zero MIME reference.

## Access and updates

The plugin keeps a separate page grant cache and one grant chain per account. Page reads use a one-minute live-check window and a fixed 30-minute ceiling. Changes need a fresh Press write check. Saved secrets use AES-GCM with a purpose, so ciphertext cannot move between accounts or grant rows.

The service account needs workspace Can write. The member also needs write access. Restricted folders need their own grants. A processing token is sealed to the saved account destination. The trusted backend also holds interactive grants, which can seal other writable workspace paths.

After a plugin update, each connecting member must reopen the new page to repair Press access. A reinstall needs Gmail Reconnect for old active rows. Local Disconnect keeps the account ledger and Files. There is no uninstall callback and no age-based token deletion.

## Release checks

Code completion and release readiness are separate. Release needs all plan tests, guard-removal proofs, installed-frame Playwriter checks, and a real 24-hour hosting measurement. The Free byte-limit gap remains open. No capacity claim is made yet.
