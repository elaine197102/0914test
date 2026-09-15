const { get } = require("@vercel/blob");

let indexPromise;

async function loadIndex() {
  if (!indexPromise) {
    indexPromise = get("index/qmi-index.json", { access: "private" }).then(async (blob) => {
      if (!blob) throw new Error("Search index not found");
      return JSON.parse(await new Response(blob.stream).text());
    });
  }
  return indexPromise;
}

function scoreChunk(text, query) {
  const haystack = text.toLowerCase();
  let score = 0;
  let cursor = 0;
  while ((cursor = haystack.indexOf(query, cursor)) !== -1) {
    score += 1;
    cursor += query.length;
  }
  return score;
}

function snippet(text, query) {
  const lower = text.toLowerCase();
  const at = lower.indexOf(query);
  const start = Math.max(0, at - 120);
  const end = Math.min(text.length, at + query.length + 260);
  return `${start ? "…" : ""}${text.slice(start, end).replace(/\s+/g, " ")}${end < text.length ? "…" : ""}`;
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET") return response.status(405).json({ error: "Only GET is supported" });
  const query = String(new URL(request.url, "https://localhost").searchParams.get("q") || "").trim().toLowerCase();
  if (query.length < 2) return response.status(400).json({ error: "請提供至少 2 個字元的查詢詞 q" });
  try {
    const index = await loadIndex();
    const results = index.documents.flatMap((document) => document.chunks.map((text, index) => ({ document: document.name, chunk: index + 1, text })))
      .map((chunk) => ({ ...chunk, score: scoreChunk(chunk.text, query) }))
      .filter((chunk) => chunk.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map((chunk) => ({ document: chunk.document, chunk: chunk.chunk, score: chunk.score, snippet: snippet(chunk.text, query) }));
    response.setHeader("Cache-Control", "private, max-age=60");
    return response.status(200).json({ query, total: results.length, results });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "文件索引暫時無法使用" });
  }
};
