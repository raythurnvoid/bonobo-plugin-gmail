import { bonobo_connect } from "bonobo-plugin-sdk/frontend";
import { createRoot } from "react-dom/client";

const container = document.getElementById("root");
if (!container) throw new Error("index.html is missing the #root element");
const root = createRoot(container);
root.render(<main role="status">Connecting to Press…</main>);

bonobo_connect()
	.then(
		async (client) => {
			if (client.context.kind === "page") document.title = client.context.pageTitle;
			// Both pages use this one entry. Load only the open page, so its CSS never styles the other page.
			if (client.context.kind === "page" && client.context.pageId === "mail") {
				const { MailApp } = await import("./mail-app");
				root.render(<MailApp client={client} />);
			} else {
				const { GmailPage } = await import("./gmail-page");
				root.render(<GmailPage client={client} />);
			}
		},
		() => root.render(<main role="alert">Press access changed. Reopen the page.</main>),
	)
	.catch(() => root.render(<main role="alert">The page could not load. Reload it.</main>));
