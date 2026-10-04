process.env.PRESS_HTTP_URL = "https://press.test";
process.env.PRESS_GMAIL_SERVICE_SECRET = "pse_testservice";
process.env.GMAIL_PLUGIN_ENCRYPTION_KEY = btoa(String.fromCharCode(...new Uint8Array(32).fill(1)));
