const { get } = require("@vercel/blob");
const sql = require("../db");

module.exports = async function handler(request, response) {
  if (request.method !== "GET") return response.status(405).send("Only GET is supported");
  const id = new URL(request.url, "https://localhost").searchParams.get("document_id");
  if (!id) return response.status(400).send("Missing document_id");
  try {
    const rows = await sql`SELECT file_path, file_type FROM source_documents WHERE id = ${id} LIMIT 1`;
    if (!rows.length) return response.status(404).send("Source document not found");
    const blob = await get(rows[0].file_path, { access: "private" });
    if (!blob) return response.status(404).send("Source document not found");
    response.setHeader("Content-Type", rows[0].file_type === "pdf" ? "application/pdf" : "application/msword");
    response.setHeader("Content-Disposition", "inline");
    response.setHeader("Cache-Control", "private, no-cache");
    return response.status(200).send(Buffer.from(await new Response(blob.stream).arrayBuffer()));
  } catch (error) {
    console.error(error);
    return response.status(500).send("Unable to load source document");
  }
};
