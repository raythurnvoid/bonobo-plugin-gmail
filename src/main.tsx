import { bonobo_connect } from "bonobo-plugin-sdk/frontend";
import { createRoot } from "react-dom/client";
import "./gmail.css";

const container = document.getElementById("root");
if (!container) throw new Error("index.html is missing the #root element");
const root = createRoot(container);
root.render(<main className="GmailPage" role="status">Connecting to Press…</main>);

bonobo_connect().then(client => {
	if (client.context.kind === "page") document.title = client.context.pageTitle;
	root.render(<main className="GmailPage" data-gmail-service-status="setup">
		<h1>Gmail</h1>
		<p role="status">Gmail setup is in progress. Connection is not enabled yet.</p>
		<p>Sent and received emails will be saved in Files. People with file access can read them.</p>
	</main>);
}, () => root.render(<main className="GmailPage" role="alert">Press access changed. Reopen the Gmail page.</main>));
