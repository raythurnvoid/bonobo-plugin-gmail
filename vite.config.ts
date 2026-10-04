import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Keep the page separate from libraries so the publisher can read it.
export default defineConfig({
	plugins: [
		react(),
		{
			// Adapted from Chitchat. Zod must use its no-eval path in the plugin frame.
			name: "strip-zod-eval-probe",
			transform(code, id) {
				if (!id.includes("zod")) return null;
				const probe = /const F = Function;\s*new F\(""\);\s*return true;/;
				return probe.test(code) ? { code: code.replace(probe, "return false;"), map: null } : null;
			},
		},
	],
	base: "./",
	build: {
		outDir: "dist/frontend",
		cssMinify: false,
		minify: "oxc",
		rolldownOptions: { output: {
			entryFileNames: "assets/index.js",
			chunkFileNames: "assets/[name].js",
			assetFileNames: "assets/index[extname]",
			codeSplitting: {
				groups: [
					{ name: "react", test: /node_modules[\\/](?:react(?:-dom)?|scheduler)[\\/]/ },
					{ name: "zod", test: /node_modules[\\/]zod[\\/]/ },
				],
			},
		} },
	},
});
