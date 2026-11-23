// Helper query mentah untuk endpoint Wali Santri (aman dari SQL injection: nilai lewat replacements).

/** Arah urutan hanya boleh asc / desc. */
const arahUrut = (orderBy) => (String(orderBy).toLowerCase() === "asc" ? "asc" : "desc");

/**
 * Bangun LIMIT dari paginationMiddleware (req.query.page sudah berupa offset).
 * @returns { limit, replacements, pageSize, pageNo } — limit "" bila tanpa paginasi.
 */
function paginasi(page, pageSize) {
  const size = parseInt(pageSize, 10);
  const offset = parseInt(page, 10);
  if (!Number.isFinite(size) || size <= 0 || !Number.isFinite(offset) || offset < 0) {
    return { limit: "", replacements: {}, pageSize: undefined, pageNo: undefined };
  }
  return {
    limit: "LIMIT :limitSize OFFSET :limitOffset",
    replacements: { limitSize: size, limitOffset: offset },
    pageSize: size,
    pageNo: Math.floor(offset / size) + 1,
  };
}

/** Field paginasi untuk respons (bentuk lama dipertahankan). */
const infoHalaman = (pg, totalData) => ({
  page: pg.pageNo,
  nextPage: pg.pageNo !== undefined ? pg.pageNo + 1 : undefined,
  previousPage: pg.pageNo !== undefined ? pg.pageNo - 1 : undefined,
  pageSize: pg.pageSize,
  totalData,
});

module.exports = { arahUrut, paginasi, infoHalaman };
