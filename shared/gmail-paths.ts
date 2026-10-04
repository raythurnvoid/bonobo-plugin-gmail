// Same separator rules as Press shared/files.ts. Trim again after cutting.
export function gmail_slug(text: string, limit = 120) {
	return text.normalize("NFKD").replace(/\p{Mark}/gu, "").toLowerCase()
		.replace(/[^a-z0-9._-]+/g, "-").replace(/[._-]{2,}/g, "-")
		.replace(/^[._-]+|[._-]+$/g, "").slice(0, limit).replace(/[._-]+$/g, "") || "untitled";
}
