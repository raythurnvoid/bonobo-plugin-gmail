process.env.PRESS_HTTP_URL = "https://press.test";
process.env.PRESS_GMAIL_SERVICE_SECRET = "pse_testservice";
process.env.GMAIL_PLUGIN_ENCRYPTION_KEY = btoa(String.fromCharCode(...new Uint8Array(32).fill(1)));
process.env.GMAIL_OAUTH_CLIENT_ID = "test-client";
process.env.GMAIL_OAUTH_CLIENT_SECRET = "test-secret";
process.env.GMAIL_MAX_CONNECTED_ACCOUNTS = "1";
process.env.CONVEX_SITE_URL = "https://gmail.test";
