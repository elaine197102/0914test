const sql = require("../db");

module.exports = async function handler(request, response) {
  if (request.method !== "GET") return response.status(405).json({ error: "Only GET is supported" });
  const url = new URL(request.url, "https://localhost");
  const provinceId = url.searchParams.get("province_id");
  const keyword = url.searchParams.get("keyword")?.trim() || "";
  const category = url.searchParams.get("category_id");
  const code = url.searchParams.get("code");
  const status = url.searchParams.get("status") || "published";
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("page_size") || 20)));
  const offset = (page - 1) * pageSize;
  try {
    const rows = await sql`
      SELECT d.id, d.code, d.name_zh AS name, d.category, d.definition, d.formula,
        d.numerator, d.denominator, d.unit, d.inclusion_criteria AS inclusion,
        d.exclusion_criteria AS exclusion, d.data_source AS source, d.version,
        d.effective_from AS "effectiveFrom", d.status, d.verification_status AS "verificationStatus",
        p.id AS "provinceId", p.name_zh AS "provinceName", s.id AS "sourceDocumentId", s.title AS "sourceDocument",
        d.source_page AS "sourcePage"
      FROM indicator_definitions d
      JOIN provinces p ON p.id = d.province_id
      LEFT JOIN source_documents s ON s.id = d.source_document_id
      WHERE p.is_active = true
        AND (${provinceId || null}::text IS NULL OR d.province_id = ${provinceId || null})
        AND (${category || null}::text IS NULL OR d.category = ${category || null})
        AND (${code || null}::text IS NULL OR d.code = ${code || null})
        AND (${status} = 'all' OR d.status = ${status})
        AND (${keyword} = '' OR d.search_text ILIKE ${`%${keyword}%`})
      ORDER BY d.source_document_id, d.source_page NULLS LAST, d.code, d.id
      LIMIT ${pageSize} OFFSET ${offset}`;
    const provinces = await sql`SELECT id, code, name_zh AS name, region_type AS type FROM provinces WHERE is_active = true ORDER BY sort_order, name_zh`;
    const categories = await sql`SELECT DISTINCT category FROM indicator_definitions WHERE category IS NOT NULL ORDER BY category`;
    return response.status(200).json({ data: rows, provinces, categories: categories.map((row) => row.category), meta: { page, pageSize, count: rows.length } });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "指標資料庫暫時無法使用" });
  }
};
