"use node";

import { z } from "zod";
import { v } from "convex/values";
import type { FunctionArgs } from "convex/server";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { gmail_worker_context } from "./schema";
import { gmail_decrypt, gmail_google_token_purpose } from "./gmail_secrets";
import {
  gmail_GoogleError,
  gmail_google_get,
  gmail_google_token,
  gmail_profile_response,
} from "./gmail_google";
import { gmail_HostError, gmail_host_post } from "./press";
import { gmail_verify_live } from "./gmail_page";
import { gmail_ResponseTooLarge } from "../shared/gmail-request";
import {
  GMAIL_ATTACHMENT_BYTES,
  GMAIL_BODY_BYTES,
  GMAIL_JSON_BYTES,
  gmail_ContentError,
  gmail_body_text,
  gmail_decode_base64,
  gmail_discover_message,
  gmail_file_path,
  gmail_format_markdown,
  gmail_history_events,
} from "../shared/gmail-codec";

type Claim = FunctionArgs<typeof internal.gmail_accounts.save_message>["claim"];
type Task = Doc<"messages_ledger">["attachments"][number];
type Traversal = FunctionArgs<
  typeof internal.gmail_accounts.save_traversal
>["before"];
type SliceError = FunctionArgs<
  typeof internal.gmail_accounts.finish_slice
>["error"];

class StaleWork extends Error {}
class UnitStopped extends Error {}
class SourceStopped extends Error {
  constructor(readonly code: SliceError) {
    super(code ?? "sync_error");
  }
}

const upload_base = {
  path: z.string().min(1).max(4096),
  nodeId: z.string().min(1).max(128),
};
const upload_transport = z.object({
  ...upload_base,
  state: z.literal("pending"),
  uploadUrl: z.url(),
  headers: z.record(z.string(), z.string()),
  uploadUrlExpiresAt: z.number().positive(),
});
const upload_response = z.discriminatedUnion("state", [
  upload_transport,
  z.object({
    ...upload_base,
    state: z.literal("committed"),
    actualBytes: z.number().int().nonnegative(),
  }),
]);
const finalize_response = z.object({
  ...upload_base,
  state: z.enum(["pending", "committed", "released"]),
  actualBytes: z.number().int().nonnegative().nullable(),
});
const source_part = z.object({
  size: z.number().int().nonnegative(),
  data: z.string(),
});
const list_response = z.object({
  messages: z
    .array(z.object({ id: z.string().regex(/^[0-9a-f]+$/) }))
    .max(25)
    .optional()
    .default([]),
  nextPageToken: z.string().max(2048).optional(),
});
const upload_root = "/api/v1/files/service-uploads/" as const;
const collision = "A file already exists at this path";
const released = [
  "This target was already released",
  "This target's upload expired",
];
const plan_refusals = ["This workspace's plan does not include file uploads"];
const storage_refusals = ["This workspace has reached its storage limit"];

function checkpoint(account: Doc<"gmail_accounts">): Traversal {
  return {
    historyId: account.historyId,
    backfillPageToken: account.backfillPageToken,
    backfillPage: account.backfillPage,
    backfillComplete: account.backfillComplete,
    historyPageToken: account.historyPageToken,
    historyAnchor: account.historyAnchor,
    historyPageSize: account.historyPageSize,
  };
}

function unresolved(task: Task) {
  return !["saved", "not_saved"].includes(task.state);
}
function target_keys(task: Task) {
  return {
    idempotencyKey: task.request!.idempotencyKey,
    targetKey: task.request!.targetKey,
  };
}

export const work_account_slice = internalAction({
  args: { work: gmail_worker_context },
  returns: v.null(),
  handler: async (ctx, { work }) => {
    let note: "plan" | "storage" | "clear" | null = null;
    let accessToken: string | null = null;
    let accessExpiresAt = 0;
    let steps = 0;
    const startedAt = Date.now();
    const budget = () => steps < 25 && Date.now() - startedAt < 40_000;

    async function current() {
      const value: {
        account: Doc<"gmail_accounts">;
        grant: Doc<"host_grants">;
      } | null = await ctx.runQuery(internal.gmail_accounts.get_worker, {
        work,
      });
      if (!value) throw new StaleWork();
      return value;
    }

    async function google(path: string, maximum: number, timeout = 20_000) {
      const { account } = await current();
      if (account.sourceError) throw new SourceStopped(account.sourceError);
      if (!accessToken || accessExpiresAt <= Date.now() + 30_000) {
        if (!account.googleRefreshToken)
          throw new SourceStopped("google_revoked");
        const refreshToken = await gmail_decrypt(
          account.googleRefreshToken,
          gmail_google_token_purpose(
            account.hostOrganizationId,
            account.hostWorkspaceId,
            account.emailAddress,
          ),
        );
        await current();
        const result = await gmail_google_token({ refreshToken });
        accessToken = result.access_token;
        accessExpiresAt = Date.now() + result.expires_in * 1000;
      }
      await current();
      return gmail_google_get(path, accessToken, maximum, timeout);
    }

    async function traversal(
      before: Traversal,
      after: Traversal,
      completedHistory = false,
    ) {
      if (
        !(await ctx.runMutation(internal.gmail_accounts.save_traversal, {
          work,
          before,
          after,
          completedHistory,
        }))
      )
        throw new StaleWork();
    }

    async function unit(
      initial: Doc<"messages_ledger">,
      initialClaim: Claim = null,
    ) {
      let row = initial;
      let claim = initialClaim;
      if (
        ["done", "skipped", "given_up"].includes(row.status) ||
        (!claim &&
          (row.permissionHeld || (row.nextAttemptAt ?? Infinity) > Date.now()))
      )
        return;
      steps++;
      async function guard() {
        if (
          !(await ctx.runQuery(internal.gmail_accounts.guard_message, {
            work,
            row,
            claim,
          }))
        )
          throw new StaleWork();
      }
      async function save(
        next: Partial<Doc<"messages_ledger">>,
        proof: "email_write" | number | null = null,
        transfer = false,
      ) {
        const result: Doc<"messages_ledger"> | null = await ctx.runMutation(
          internal.gmail_accounts.save_message,
          {
            work,
            before: row,
            after: { ...row, ...next, updatedAt: Date.now() },
            claim,
            proof,
            transfer,
          },
        );
        if (!result) throw new StaleWork();
        row = result;
        claim =
          row.permissionHeld && claim
            ? { ...claim, operation: row.fileAccessOperation! }
            : null;
      }
      async function task_save(
        index: number,
        patch: Partial<Task>,
        proof: number | null = null,
        transfer = false,
      ) {
        const attachments = row.attachments.map((task, i) =>
          i === index ? { ...task, ...patch } : task,
        );
        const next = {
          attachments,
          settlementNeeded: attachments.some(
            (task) => unresolved(task) && task.request !== null,
          ),
          ...(transfer
            ? {
                fileAccessOperation: {
                  kind: "attachment" as const,
                  index,
                  operation: "create" as const,
                },
              }
            : {}),
        };
        // Save task progress and the message retry time before a worker can stop.
        await finish(next, proof, transfer);
      }
      async function host<T>(
        route:
          | "/api/v1/files/write"
          | `${typeof upload_root}create-target`
          | `${typeof upload_root}remint`
          | `${typeof upload_root}finalize`,
        run: (token: string) => Promise<T>,
        operation: NonNullable<Doc<"messages_ledger">["fileAccessOperation"]>,
      ) {
        await guard();
        const delay = await ctx.runMutation(
          internal.gmail_accounts.pace_press,
          { work, route },
        );
        if (delay === null) throw new StaleWork();
        // A short shared pace avoids burst errors. Longer waits release the slot.
        if (delay > 1000) throw new gmail_HostError(429, "local_pace", delay);
        if (delay > 0)
          await new Promise((resolve) => setTimeout(resolve, delay));
        await guard();
        const { account, grant } = await current();
        const token = await gmail_decrypt(
          grant.sealedSecret!,
          `grant:${grant._id}:sealed`,
        );
        try {
          return await run(token);
        } catch (error) {
          if (
            !(error instanceof gmail_HostError) ||
            error.status !== 403 ||
            plan_refusals.includes(error.reason) ||
            storage_refusals.includes(error.reason)
          )
            throw error;
          await guard();
          const live = await gmail_verify_live(
            token,
            account.hostInstallationId,
            "processing",
            account.destinationPath,
          );
          if (!live.contentPermissions.write)
            throw new gmail_HostError(403, "actor_lost");
          await save({
            status: "failed",
            error: "file_access",
            permissionHeld: true,
            fileAccessOperation: operation,
            nextAttemptAt: Math.max(
              row.nextAttemptAt ?? 0,
              Date.now() + 3600_000,
            ),
          });
          throw new UnitStopped();
        }
      }
      async function finish(
        next: Partial<Doc<"messages_ledger">> = {},
        proof: number | null = null,
        transfer = false,
      ) {
        const progress = { ...row, ...next };
        const tasks = progress.attachments;
        const remaining = tasks.filter(unresolved);
        const failed = tasks.some((task) => task.state === "unconfirmed");
        const terminal = !remaining.length;
        let status: Doc<"messages_ledger">["status"] = failed
          ? "given_up"
          : terminal && progress.skipReason
            ? "skipped"
            : terminal &&
                progress.error &&
                [
                  "source_too_large",
                  "mime_too_large",
                  "invalid_source",
                ].includes(progress.error)
              ? "given_up"
              : terminal && progress.emailWritten
                ? "done"
                : progress.permissionHeld
                  ? "failed"
                  : "pending";
        if (row.status === "given_up") status = "given_up";
        const final = ["done", "skipped", "given_up"].includes(status);
        const times = remaining.flatMap((task) =>
          task.nextAttemptAt === null ? [] : [task.nextAttemptAt],
        );
        await save(
          {
            ...next,
            status,
            nextAttemptAt: final
              ? null
              : times.length
                ? Math.min(...times)
                : Date.now() + 60_000,
            settlementNeeded:
              !final && remaining.some((task) => task.request !== null),
            attachmentsNotSaved: tasks.filter(
              (task) => task.state === "not_saved",
            ).length,
            ...(failed ? { error: "settlement_unconfirmed" } : {}),
            ...(final
              ? { permissionHeld: false, fileAccessOperation: null }
              : {}),
          },
          proof,
          transfer,
        );
      }
      let selected = row.attachments.findIndex(
        (task) => unresolved(task) && (task.nextAttemptAt ?? 0) <= Date.now(),
      );
      if (
        claim?.operation.kind === "attachment" &&
        unresolved(row.attachments[claim.operation.index])
      )
        selected = claim.operation.index;
      let pendingFinalized = false;
      let uncertainAbsent = false;
      const sourceLimited = [
        "source_too_large",
        "mime_too_large",
        "invalid_source",
      ].includes(row.error ?? "");
      const settlementOnly =
        selected >= 0 &&
        row.attachments[selected].reason?.endsWith("_settlement_only");
      async function finish_without_source(
        account: Doc<"gmail_accounts">,
        answer: { nodeId: string; path: string } | null = null,
        next: Partial<Doc<"messages_ledger">> = {},
      ) {
        const attachments = row.attachments.map((task, index) => {
          if (index === selected && unresolved(task) && task.request) {
            const checks =
              task.sourceUnavailablePendingChecks + Number(pendingFinalized);
            const state = uncertainAbsent
              ? "not_saved"
              : task.request.installationId !== account.hostInstallationId ||
                  checks >= 5
                ? "unconfirmed"
                : answer
                  ? "pending"
                  : task.state;
            return {
              ...task,
              ...(answer
                ? { accepted: true, nodeId: answer.nodeId, livePath: answer.path }
                : {}),
              state,
              sourceUnavailablePendingChecks: checks,
              nextAttemptAt:
                state === "not_saved" || state === "unconfirmed"
                  ? null
                  : Date.now() + 60_000,
              // Keep refused uploads in finalize-only recovery.
              reason: settlementOnly ? task.reason : "source_unavailable",
            };
          }
          if (unresolved(task) && !task.request) {
            // Paused source-only parts must not hide a due receipt.
            if (account.sourceError || settlementOnly)
              return { ...task, nextAttemptAt: null };
            return {
              ...task,
              state: "not_saved" as const,
              reason: "source_unavailable",
              nextAttemptAt: null,
            };
          }
          return task;
        });
        await finish({ ...next, attachments }, answer ? selected : null);
      }
      try {
        if (selected >= 0 && row.attachments[selected].request) {
          const task = row.attachments[selected];
          const { account } = await current();
          if (task.request!.installationId === account.hostInstallationId) {
            try {
              const answer = await host(
                `${upload_root}finalize`,
                (token) =>
                  gmail_host_post(
                    `${upload_root}finalize`,
                    target_keys(task),
                    token,
                    finalize_response,
                  ),
                { kind: "attachment", index: selected, operation: "finalize" },
              );
              if (answer.state === "committed") {
                if (answer.actualBytes !== task.request!.size)
                  throw new gmail_HostError(502, "invalid_response");
                await task_save(
                  selected,
                  {
                    state: "saved",
                    accepted: true,
                    nodeId: answer.nodeId,
                    livePath: answer.path,
                    nextAttemptAt: null,
                    reason: null,
                  },
                  selected,
                );
                await finish();
                return;
              }
              if (answer.state === "released") {
                await task_save(selected, {
                  state: "not_saved",
                  nextAttemptAt: null,
                  reason: "released",
                });
                await finish();
                return;
              }
              pendingFinalized = true;
              if (
                account.sourceError ||
                row.deletedAt ||
                row.skipReason ||
                sourceLimited ||
                settlementOnly
              ) {
                // Save the reply, check count and due time in one mutation.
                await finish_without_source(account, answer);
                return;
              }
              await task_save(
                selected,
                {
                  state: "pending",
                  accepted: true,
                  nodeId: answer.nodeId,
                  livePath: answer.path,
                  nextAttemptAt: Date.now() + 60_000,
                },
                selected,
              );
            } catch (error) {
              if (
                !(error instanceof gmail_HostError) ||
                (error.status !== 404 &&
                  !(error.status === 409 && released.includes(error.reason)))
              )
                throw error;
              if (task.accepted || error.status === 409) {
                await task_save(selected, {
                  state: "not_saved",
                  nextAttemptAt: null,
                  reason: "released",
                });
                await finish();
                return;
              }
              uncertainAbsent = true;
            }
          }
        }
        const { account } = await current();
        let message: ReturnType<typeof gmail_discover_message> | null = null;
        if (
          !account.sourceError &&
          !row.deletedAt &&
          !row.skipReason &&
          !sourceLimited &&
          !settlementOnly
        ) {
          try {
            await guard();
            message = gmail_discover_message(
              await google(
                `/messages/${row.gmailMessageId}?format=full`,
                GMAIL_JSON_BYTES,
              ),
            );
            if (message.id !== row.gmailMessageId)
              throw new gmail_ContentError("invalid_source");
            const skipReason = message.labels.includes("SPAM")
              ? "spam"
              : message.labels.includes("TRASH")
                ? "trash"
                : message.labels.includes("DRAFT")
                  ? "draft"
                  : null;
            if (skipReason) {
              // Save newly lost source and its pending check together.
              await finish_without_source(account, null, { skipReason });
              return;
            }
          } catch (error) {
            if (error instanceof gmail_GoogleError && error.status === 404) {
              await finish_without_source(account, null, {
                skipReason: "deleted_before_fetch",
                deletedAt: row.deletedAt ?? Date.now(),
              });
              return;
            } else if (
              error instanceof gmail_ContentError ||
              error instanceof gmail_ResponseTooLarge
            ) {
              await finish_without_source(account, null, {
                error:
                  error instanceof gmail_ContentError
                    ? error.code
                    : "source_too_large",
              });
              return;
            } else throw error;
          }
        }
        if (!message) {
          await finish_without_source(account);
          return;
        }
        if (!row.filePath) {
          const filePath = gmail_file_path(message, account.destinationPath);
          const folder = filePath.replace(/\.md$/, "-attachments");
          if (message.attachments.some((part) => part.contentType.length > 200))
            throw new gmail_ContentError("invalid_source");
          await save({
            filePath,
            gmailThreadId: message.threadId,
            internalDate: message.internalDate,
            attachments: message.attachments.map((part) => ({
              partId: part.partId,
              filename: part.filename,
              displayName: part.displayName,
              initialPath: `${folder}/${part.filename}`,
              contentType: part.contentType,
              size: part.size,
              suffix: 0,
              request: null,
              state: "unstarted",
              accepted: false,
              uploadAttemptedAt: null,
              deliveries: 0,
              sourceUnavailablePendingChecks: 0,
              nextAttemptAt: Date.now(),
              nodeId: null,
              livePath: null,
              reason: null,
            })),
          });
        }
        async function part_bytes(
          part: { size: number; data?: string; attachmentId?: string },
          maximum: number,
          requireExactSize: boolean,
          timeout = 20_000,
        ) {
          if (part.size > maximum) throw new gmail_ContentError("too_large");
          let data = part.data;
          if (data === undefined && part.attachmentId) {
            await guard();
            const parsed = source_part.safeParse(
              await google(
                `/messages/${row.gmailMessageId}/attachments/${encodeURIComponent(part.attachmentId)}`,
                GMAIL_JSON_BYTES,
                timeout,
              ),
            );
            if (
              !parsed.success ||
              (requireExactSize && parsed.data.size !== part.size)
            )
              throw new gmail_ContentError("invalid_source");
            data = parsed.data.data;
          }
          const bytes = gmail_decode_base64(data ?? "", maximum);
          // Gmail can report a text size that differs from the decoded bytes.
          if (requireExactSize && bytes.length !== part.size)
            throw new gmail_ContentError("invalid_source");
          return bytes;
        }
        if (!row.emailWritten) {
          const bodyStartedAt = Date.now();
          const parts = [];
          let body: string;
          try {
            for (const part of message.bodyParts) {
              if (Date.now() - bodyStartedAt >= 60_000)
                throw new gmail_ContentError("too_large");
              parts.push({
                bytes: await part_bytes(
                  part,
                  GMAIL_BODY_BYTES,
                  false,
                  Math.min(20_000, 60_000 - (Date.now() - bodyStartedAt)),
                ),
                charset: part.charset,
                mimeType: part.mimeType,
              });
            }
            body = message.bodyLimit
              ? `Body not copied: it exceeds this plugin's ${message.bodyLimit === "parts" ? "part" : "size"} limit. Read it in Gmail.`
              : gmail_body_text(parts);
          } catch (error) {
            if (
              !(
                error instanceof gmail_ContentError &&
                error.code === "too_large"
              ) &&
              !(error instanceof gmail_ResponseTooLarge) &&
              !(
                Date.now() - bodyStartedAt >= 60_000 &&
                error instanceof DOMException &&
                error.name === "TimeoutError"
              )
            )
              throw error;
            body = `Body not copied: it exceeds this plugin's ${Date.now() - bodyStartedAt >= 60_000 ? "time" : "size"} limit. Read it in Gmail.`;
          }
          const markdown = gmail_format_markdown(message, body);
          try {
            const answer = await host(
              "/api/v1/files/write",
              (token) =>
                gmail_host_post(
                  "/api/v1/files/write",
                  {
                    path: row.filePath!,
                    content: markdown,
                    contentType: "text/markdown",
                    overwrite: "fail",
                    nonCollaborative: false,
                  },
                  token,
                  z.object({ nodeId: z.string().min(1) }),
                ),
              { kind: "email_write" },
            );
            await save(
              {
                emailWritten: true,
                fileNodeId: answer.nodeId,
                status: "pending",
                error: null,
              },
              "email_write",
            );
          } catch (error) {
            if (
              !(error instanceof gmail_HostError) ||
              error.status !== 409 ||
              error.reason !== collision
            )
              throw error;
            await save({
              emailWritten: true,
              emailAssumed: true,
              fileNodeId: null,
            });
          }
        }
        if (selected < 0)
          selected = row.attachments.findIndex(
            (task) =>
              unresolved(task) && (task.nextAttemptAt ?? 0) <= Date.now(),
          );
        if (selected < 0) {
          await finish();
          return;
        }
        let task = row.attachments[selected];
        const source = message.attachments[selected];
        if (!source || source.partId !== task.partId)
          throw new gmail_ContentError("invalid_source");
        if (
          !task.request &&
          (source.size === 0 || source.size > GMAIL_ATTACHMENT_BYTES)
        ) {
          await task_save(selected, {
            state: "not_saved",
            reason: source.size === 0 ? "empty" : "too_large",
            nextAttemptAt: null,
          });
          await finish();
          return;
        }
        if (
          pendingFinalized &&
          task.uploadAttemptedAt !== null &&
          Date.now() - task.uploadAttemptedAt < 180_000
        ) {
          await task_save(selected, { nextAttemptAt: Date.now() + 60_000 });
          await finish();
          return;
        }
        if (task.deliveries >= 5) {
          await task_save(selected, {
            state: "unconfirmed",
            reason: "delivery_failed",
            nextAttemptAt: null,
          });
          await finish();
          return;
        }
        let bytes: ReturnType<typeof gmail_decode_base64>;
        try {
          bytes = await part_bytes(source, GMAIL_ATTACHMENT_BYTES, true);
        } catch (error) {
          if (
            !(
              error instanceof gmail_ContentError && error.code === "too_large"
            ) &&
            !(error instanceof gmail_ResponseTooLarge)
          )
            throw error;
          await task_save(
            selected,
            task.accepted
              ? {
                  reason: "too_large_settlement_only",
                  nextAttemptAt: Date.now() + 60_000,
                }
              : {
                  state: "not_saved",
                  reason: "too_large",
                  nextAttemptAt: null,
                },
          );
          await finish();
          return;
        }
        if (
          task.request &&
          (task.request.size !== bytes.length ||
            task.request.contentType !== source.contentType)
        )
          throw new gmail_ContentError("invalid_source");
        const replacement =
          task.request !== null &&
          task.request.installationId !== account.hostInstallationId;
        async function freeze(suffix: number) {
          const dot = task.initialPath.lastIndexOf(".");
          const path =
            suffix === 0
              ? task.initialPath
              : dot > task.initialPath.lastIndexOf("/")
                ? `${task.initialPath.slice(0, dot)}-${suffix + 1}${task.initialPath.slice(dot)}`
                : `${task.initialPath}-${suffix + 1}`;
          await task_save(
            selected,
            {
              suffix,
              state: "uncertain",
              accepted: false,
              uploadAttemptedAt: null,
              nodeId: null,
              livePath: null,
              request: {
                installationId: account.hostInstallationId,
                idempotencyKey: `${account._id}:${row.gmailMessageId}`,
                targetKey: `${row.gmailMessageId}:att-${selected}`,
                path,
                contentType: source.contentType,
                size: bytes.length,
                readOnly: false,
                nonCollaborative: false,
              },
            },
            null,
            claim?.operation.kind === "attachment" &&
              claim.operation.index === selected,
          );
          task = row.attachments[selected];
        }
        if (!task.request || replacement) {
          if (replacement && task.suffix >= 4)
            throw new gmail_HostError(409, "replacement_limit");
          await freeze(replacement ? task.suffix + 1 : task.suffix);
        }
        let transport: z.infer<typeof upload_transport> | null = null;
        for (;;) {
          try {
            const remint =
              !replacement &&
              pendingFinalized &&
              task.uploadAttemptedAt !== null;
            const route =
              `${upload_root}${remint ? "remint" : "create-target"}` as const;
            const { installationId: _installationId, ...request } =
              task.request!;
            const answer = await host(
              route,
              (token) =>
                remint
                  ? gmail_host_post(
                      `${upload_root}remint`,
                      target_keys(task),
                      token,
                      upload_response,
                    )
                  : gmail_host_post(
                      `${upload_root}create-target`,
                      request,
                      token,
                      upload_response,
                    ),
              { kind: "attachment", index: selected, operation: "create" },
            );
            if (!task.accepted) note = "clear";
            if (answer.state === "committed") {
              if (answer.actualBytes !== task.request!.size)
                throw new gmail_HostError(502, "invalid_response");
              await task_save(
                selected,
                {
                  state: "saved",
                  accepted: true,
                  nodeId: answer.nodeId,
                  livePath: answer.path,
                  nextAttemptAt: null,
                  reason: null,
                },
                selected,
              );
              await finish();
              return;
            }
            if (answer.uploadUrlExpiresAt <= Date.now())
              throw new gmail_HostError(502, "invalid_response");
            await task_save(
              selected,
              {
                state: "pending",
                accepted: true,
                nodeId: answer.nodeId,
                livePath: answer.path,
              },
              selected,
            );
            transport = answer;
            break;
          } catch (error) {
            if (!(error instanceof gmail_HostError)) throw error;
            if (
              error.status === 403 &&
              (plan_refusals.includes(error.reason) ||
                storage_refusals.includes(error.reason))
            ) {
              note = plan_refusals.includes(error.reason) ? "plan" : "storage";
              if (task.accepted)
                await task_save(selected, {
                  nextAttemptAt: Date.now() + 60_000,
                  reason: `${note}_settlement_only`,
                });
              else
                await save({
                  attachments: row.attachments.map((part, i) =>
                    i === selected || !part.request
                      ? {
                          ...part,
                          state: "not_saved",
                          reason: note,
                          nextAttemptAt: null,
                        }
                      : part,
                  ),
                });
              await finish();
              return;
            }
            if (
              error.status === 409 &&
              error.reason === collision &&
              replacement &&
              task.suffix < 4
            ) {
              await freeze(task.suffix + 1);
              continue;
            }
            if (error.status === 409 && released.includes(error.reason)) {
              await task_save(selected, {
                state: "not_saved",
                reason: "released",
                nextAttemptAt: null,
              });
              await finish();
              return;
            }
            throw error;
          }
        }
        task = row.attachments[selected];
        await task_save(selected, {
          uploadAttemptedAt: Date.now(),
          deliveries: task.deliveries + 1,
        });
        await guard();
        try {
          const result = await fetch(transport.uploadUrl, {
            method: "PUT",
            headers: transport.headers,
            body: bytes,
            redirect: "error",
            signal: AbortSignal.timeout(60_000),
          });
          await result.body?.cancel();
          // Even an uncertain or refused PUT may have stored bytes. Finalize first.
        } catch {
          /* The saved delivery marker makes the next check safe. */
        }
        const answer = await host(
          `${upload_root}finalize`,
          (token) =>
            gmail_host_post(
              `${upload_root}finalize`,
              target_keys(row.attachments[selected]),
              token,
              finalize_response,
            ),
          { kind: "attachment", index: selected, operation: "finalize" },
        );
        if (
          answer.state === "committed" &&
          answer.actualBytes !== row.attachments[selected].request!.size
        )
          throw new gmail_HostError(502, "invalid_response");
        await task_save(
          selected,
          {
            state:
              answer.state === "committed"
                ? "saved"
                : answer.state === "released"
                  ? "not_saved"
                  : "pending",
            nodeId: answer.nodeId,
            livePath: answer.path,
            nextAttemptAt:
              answer.state === "pending" ? Date.now() + 60_000 : null,
            reason: answer.state === "released" ? "released" : null,
          },
          answer.state === "released" ? null : selected,
        );
        await finish();
      } catch (error) {
        if (error instanceof UnitStopped) return;
        const sourceError =
          error instanceof SourceStopped || error instanceof gmail_GoogleError
            ? error.code
            : null;
        // Keep the successful pending check before saving the source stop.
        if (
          pendingFinalized &&
          (sourceError === "google_revoked" ||
            sourceError === "gmail_request" ||
            sourceError === "history_response_too_large")
        ) {
          const { account } = await current();
          await finish_without_source({ ...account, sourceError });
        }
        if (
          error instanceof StaleWork ||
          error instanceof SourceStopped ||
          error instanceof gmail_GoogleError ||
          (error instanceof gmail_HostError &&
            [401, 402, 403, 429].includes(error.status)) ||
          (error instanceof gmail_HostError && error.status >= 500) ||
          (error instanceof gmail_GoogleError && error.status >= 500)
        )
          throw error;
        if (
          !(error instanceof gmail_HostError) &&
          !(error instanceof gmail_GoogleError) &&
          !(error instanceof gmail_ContentError) &&
          !(error instanceof gmail_ResponseTooLarge)
        )
          throw error;
        const attempts = row.attempts + 1;
        const contentError =
          error instanceof gmail_ContentError ||
          error instanceof gmail_ResponseTooLarge;
        const attachments = contentError
          ? row.attachments.map((task) =>
              !task.request && unresolved(task)
                ? {
                    ...task,
                    state: "not_saved" as const,
                    reason: "source_unavailable",
                    nextAttemptAt: null,
                  }
                : task,
            )
          : row.attachments;
        const settlementNeeded = attachments.some(
          (task) => task.request !== null && unresolved(task),
        );
        const final = attempts >= 5 || (contentError && !settlementNeeded);
        await save({
          status: final ? "given_up" : "failed",
          attempts,
          attachments,
          attachmentsNotSaved: attachments.filter(
            (task) => task.state === "not_saved",
          ).length,
          error: contentError
            ? error instanceof gmail_ContentError
              ? error.code
              : "source_too_large"
            : error instanceof gmail_HostError
              ? "file_conflict"
              : "gmail_request",
          nextAttemptAt: final
            ? null
            : Date.now() +
              (contentError
                ? 60_000
                : [60_000, 600_000, 3600_000, 21600_000][attempts - 1]),
          settlementNeeded: !final && settlementNeeded,
        });
      }
    }

    async function retries() {
      async function held() {
        const rows: Doc<"messages_ledger">[] = await ctx.runQuery(
          internal.gmail_accounts.retry_candidates,
          {
            work,
            held: true,
          },
        );
        if (!rows[0] || !budget()) return false;
        const claimed = await ctx.runMutation(
          internal.gmail_accounts.claim_permission,
          { work, rowId: rows[0]._id },
        );
        if (!claimed) return false;
        await unit(claimed.row, claimed.claim);
        return true;
      }
      await held();
      const rows: Doc<"messages_ledger">[] = await ctx.runQuery(
        internal.gmail_accounts.retry_candidates,
        {
          work,
          held: false,
        },
      );
      for (const row of rows) {
        if (!budget()) break;
        await unit(row);
      }
      while (budget() && (await held())) {
        /* Each successful proof may free the next held unit. */
      }
    }

    async function backfill() {
      let { account } = await current();
      if (account.backfillComplete) {
        await retries();
        return;
      }
      if (!account.backfillPage) {
        const before = checkpoint(account);
        const path = (token: string | null) =>
          `/messages?${new URLSearchParams({ maxResults: "25", ...(token ? { pageToken: token } : {}) })}`;
        let raw: unknown;
        try {
          raw = await google(path(account.backfillPageToken), 1024 * 1024);
        } catch (error) {
          if (
            !(error instanceof gmail_GoogleError) ||
            ![400, 404].includes(error.status) ||
            !account.backfillPageToken
          )
            throw error;
          raw = await google(path(null), 1024 * 1024);
        }
        const parsed = list_response.safeParse(raw);
        if (!parsed.success) throw new SourceStopped("gmail_request");
        await traversal(before, {
          ...before,
          backfillPage: {
            ids: parsed.data.messages.map((item) => item.id),
            nextPageToken: parsed.data.nextPageToken ?? null,
            index: 0,
          },
        });
        account = (await current()).account;
      }
      while (
        account.backfillPage &&
        account.backfillPage.index < account.backfillPage.ids.length &&
        budget()
      ) {
        const before = checkpoint(account);
        const row = await ctx.runMutation(
          internal.gmail_accounts.discover_message,
          {
            work,
            gmailMessageId:
              account.backfillPage.ids[account.backfillPage.index],
            backfill: true,
          },
        );
        if (!row) throw new StaleWork();
        await unit(row);
        await traversal(before, {
          ...before,
          backfillPage: {
            ...account.backfillPage,
            index: account.backfillPage.index + 1,
          },
        });
        account = (await current()).account;
      }
      if (
        account.backfillPage &&
        account.backfillPage.index === account.backfillPage.ids.length
      ) {
        const before = checkpoint(account);
        await traversal(before, {
          ...before,
          backfillPageToken: account.backfillPage.nextPageToken,
          backfillComplete: account.backfillPage.nextPageToken === null,
          backfillPage: null,
        });
      }
    }

    async function history() {
      let { account } = await current();
      let before = checkpoint(account);
      const path = (token: string | null) => {
        const query = new URLSearchParams({
          startHistoryId: account.historyId!,
          maxResults: String(account.historyPageSize),
          fields:
            "history(id,messagesAdded(message(id,threadId)),messagesDeleted(message(id,threadId)),labelsRemoved(message(id,threadId),labelIds)),nextPageToken,historyId",
          ...(token ? { pageToken: token } : {}),
        });
        for (const kind of ["messageAdded", "messageDeleted", "labelRemoved"])
          query.append("historyTypes", kind);
        return `/history?${query}`;
      };
      let raw: unknown;
      try {
        try {
          raw = await google(path(account.historyPageToken), 16 * 1024 * 1024);
        } catch (error) {
          if (
            !(error instanceof gmail_GoogleError) ||
            ![400, 404].includes(error.status)
          )
            throw error;
          if (account.historyPageToken) {
            try {
              raw = await google(path(null), 16 * 1024 * 1024);
              await traversal(before, {
                ...before,
                historyPageToken: null,
                historyAnchor: null,
              });
              account = (await current()).account;
              before = checkpoint(account);
            } catch (probe) {
              if (!(probe instanceof gmail_GoogleError) || probe.status !== 404)
                throw probe;
              raw = null;
            }
          } else if (error.status === 404) raw = null;
          else throw error;
          if (raw === null) {
            const profile = gmail_profile_response.safeParse(
              await google("/profile", 8192),
            );
            if (!profile.success) throw new SourceStopped("gmail_request");
            await traversal(before, {
              historyId: profile.data.historyId,
              backfillPageToken: null,
              backfillPage: null,
              backfillComplete: false,
              historyPageToken: null,
              historyAnchor: null,
              historyPageSize: 25,
            });
            return;
          }
        }
      } catch (error) {
        if (!(error instanceof gmail_ResponseTooLarge)) throw error;
        if (account.historyPageSize === 1)
          throw new SourceStopped("history_response_too_large");
        await traversal(before, {
          ...before,
          historyPageSize: 1,
          historyPageToken: null,
          historyAnchor: null,
        });
        return;
      }
      const page = gmail_history_events(raw);
      let index = 0;
      if (account.historyAnchor) {
        index =
          page.events.findIndex(
            (event) =>
              event.historyId === account.historyAnchor!.historyId &&
              event.gmailMessageId === account.historyAnchor!.gmailMessageId &&
              event.kind === account.historyAnchor!.kind,
          ) + 1;
        if (index === 0) {
          await traversal(before, {
            ...before,
            historyPageToken: null,
            historyAnchor: null,
          });
          return;
        }
      }
      const ingestionStartedAt = Date.now();
      while (
        index < page.events.length &&
        Date.now() - ingestionStartedAt < 40_000
      ) {
        const events = page.events.slice(index, index + 25);
        if (
          !(await ctx.runMutation(internal.gmail_accounts.ingest_history, {
            work,
            before,
            events,
          }))
        )
          throw new StaleWork();
        index += events.length;
        before = { ...before, historyAnchor: events.at(-1)! };
      }
      if (index === page.events.length)
        await traversal(
          before,
          {
            ...before,
            historyAnchor: null,
            historyPageToken: page.nextPageToken,
            ...(page.nextPageToken === null
              ? { historyId: page.historyId }
              : {}),
          },
          page.nextPageToken === null,
        );
      if (budget()) await retries();
    }

    try {
      const { account } = await current();
      // A replay of the same work must keep its saved account backoff.
      if (
        account.temporaryFailures > 0 &&
        account.nextSyncAt !== null &&
        account.nextSyncAt > Date.now()
      )
        return null;
      if (account.sourceError) await retries();
      else {
        if (!account.historyId) {
          const profile = gmail_profile_response.safeParse(
            await google("/profile", 8192),
          );
          if (
            !profile.success ||
            profile.data.emailAddress.toLowerCase() !== account.emailAddress
          )
            throw new SourceStopped("gmail_request");
          const before = checkpoint(account);
          await traversal(before, {
            ...before,
            historyId: profile.data.historyId,
          });
        }
        if (account.nextSliceKind === "history") await history();
        else if (
          account.nextSliceKind === "backfill" &&
          !account.backfillComplete
        )
          await backfill();
        else {
          await retries();
          if (steps === 0) await history();
        }
      }
      await ctx.runMutation(internal.gmail_accounts.finish_slice, {
        work,
        error: null,
        retryAfterMs: null,
        attachmentNote: note,
      });
    } catch (error) {
      if (error instanceof StaleWork) return null;
      const code: SliceError =
        error instanceof SourceStopped
          ? error.code
          : error instanceof gmail_GoogleError
            ? error.code
            : error instanceof gmail_HostError
              ? error.status === 401 ||
                error.status === 404 ||
                error.status === 409
                ? "press_reconnect_needed"
                : error.status === 403
                  ? "actor_lost"
                  : error.status === 402
                    ? "credits"
                    : "press_temporary"
              : "sync_error";
      await ctx.runMutation(internal.gmail_accounts.finish_slice, {
        work,
        error: code,
        retryAfterMs:
          error instanceof gmail_HostError ? error.retryAfterMs : null,
        attachmentNote: note,
      });
    }
    return null;
  },
});
