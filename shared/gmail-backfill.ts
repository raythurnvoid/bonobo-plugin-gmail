// The choices a member has for how many days of old mail a connect saves. Null, not in this list,
// saves all old mail. `GMAIL_BACKFILL_MAX_DAYS` must be one of these values too.
export const gmail_BACKFILL_DAYS = [7, 30, 90, 365] as const;
