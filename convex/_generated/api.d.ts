/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as crons from "../crons.js";
import type * as gmail_accounts from "../gmail_accounts.js";
import type * as gmail_google from "../gmail_google.js";
import type * as gmail_grants from "../gmail_grants.js";
import type * as gmail_oauth from "../gmail_oauth.js";
import type * as gmail_page from "../gmail_page.js";
import type * as gmail_secrets from "../gmail_secrets.js";
import type * as gmail_worker from "../gmail_worker.js";
import type * as gmail_workpool from "../gmail_workpool.js";
import type * as http from "../http.js";
import type * as press from "../press.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  gmail_accounts: typeof gmail_accounts;
  gmail_google: typeof gmail_google;
  gmail_grants: typeof gmail_grants;
  gmail_oauth: typeof gmail_oauth;
  gmail_page: typeof gmail_page;
  gmail_secrets: typeof gmail_secrets;
  gmail_worker: typeof gmail_worker;
  gmail_workpool: typeof gmail_workpool;
  http: typeof http;
  press: typeof press;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  gmail_sync_workpool: import("@convex-dev/workpool/_generated/component.js").ComponentApi<"gmail_sync_workpool">;
};
