const sql = require("../db");

module.exports = async function handler(request, response) {
  if (request.method !== "GET") return response.status(405).json({ error: "Only GET is supported" });
  try {
    const rows = await sql`SELECT id, code, name_zh AS name, region_type AS type FROM provinces WHERE is_active = true ORDER BY sort_order, name_zh`;
    return response.status(200).json({ data: rows });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "無法取得省分資料" });
  }
};
