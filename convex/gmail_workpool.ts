import { Workpool } from "@convex-dev/workpool";
import { components } from "./_generated/api";

export const gmail_workpool = new Workpool(components.gmail_sync_workpool, {
	maxParallelism: 1, retryActionsByDefault: true,
	defaultRetryBehavior: { maxAttempts: 5, initialBackoffMs: 1000, base: 2 },
});
