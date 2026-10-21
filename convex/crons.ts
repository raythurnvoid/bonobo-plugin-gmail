import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
// The writers of each due time schedule these runs. These crons only catch a lost schedule.
crons.interval("Gmail accounts", { minutes: 15 }, internal.gmail_accounts.dispatch);
crons.interval("Gmail grants", { minutes: 15 }, internal.gmail_grants.sweep);
crons.interval("Gmail expired page sessions and attempts", { minutes: 5 }, internal.gmail_oauth.cleanup);
export default crons;
