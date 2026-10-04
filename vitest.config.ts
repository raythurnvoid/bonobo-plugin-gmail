import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		restoreMocks: true,
		projects: [
			{ extends: true, test: { name: "frontend", environment: "happy-dom", include: ["src/**/*.test.{ts,tsx}"] } },
			{ extends: true, test: { name: "shared", environment: "node", include: ["shared/**/*.test.ts"] } },
			{ extends: true, test: { name: "convex", environment: "edge-runtime", include: ["convex/**/*.test.ts"], setupFiles: ["scripts/test-setup.ts"] } },
		],
	},
});
