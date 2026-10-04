export class gmail_ResponseTooLarge extends Error {
	constructor() { super("source_too_large"); }
}

// Count streamed bytes before parsing. Content-Length cannot prove the size.
export async function gmail_read_json(body: ReadableStream<Uint8Array> | null, maximum: number): Promise<unknown> {
	if (!body) throw new Error("Missing JSON body");
	const reader = body.getReader();
	const chunks: Uint8Array[] = [];
	let size = 0;
	while (true) {
		const next = await reader.read();
		if (next.done) break;
		size += next.value.byteLength;
		if (size > maximum) { await reader.cancel(); throw new gmail_ResponseTooLarge(); }
		chunks.push(next.value);
	}
	const bytes = new Uint8Array(size);
	let offset = 0;
	for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
	chunks.length = 0;
	return JSON.parse(new TextDecoder().decode(bytes));
}
