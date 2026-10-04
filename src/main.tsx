import { bonobo_connect } from "bonobo-plugin-sdk/frontend";
import { createRoot } from "react-dom/client";
import { GmailPage } from "./gmail-page";
import "./gmail.css";

const container = document.getElementById("root");
if (!container) throw new Error("index.html is missing the #root element");
const root = createRoot(container);
root.render(
	<main className="GmailPage" role="status">
		Connecting to Press…
	</main>,
);

bonobo_connect().then(
	(client) => {
		if (client.context.kind === "page") document.title = client.context.pageTitle;
		root.render(<GmailPage client={client} />);
	},
	() =>
		root.render(
			<main className="GmailPage" role="alert">
				Press access changed. Reopen the Gmail page.
			</main>,
		),
);
