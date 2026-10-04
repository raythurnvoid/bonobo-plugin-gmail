import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Press publishes these three fixed files. Keep one JS chunk.
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
	esbuild: { minifyIdentifiers: true, minifySyntax: true, minifyWhitespace: true },
	build: {
		outDir: "dist/frontend",
		cssMinify: false,
		minify: "esbuild",
		rollupOptions: { output: {
			entryFileNames: "assets/index.js",
			chunkFileNames: "assets/[name].js",
			assetFileNames: "assets/index[extname]",
			codeSplitting: false,
		} },
	},
});
