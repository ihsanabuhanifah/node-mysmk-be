// Audit log aktivitas staf (khusus Admin)
const models = require("../../models");
const { Op } = require("sequelize");

const AKSI = ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGIN_GAGAL", "LOGOUT"];
const isTanggal = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ""));

// GET /guru/audit-log?keyword=&action=&dari=YYYY-MM-DD&sampai=YYYY-MM-DD&page=&pageSize=
//   keyword: cari nama / email user
//   dari/sampai: rentang tanggal (WIB), sampai inklusif
async function listAuditLog(req, res) {
  try {
    const limit = Math.min(Number(req.query.pageSize) || 10, 100);
    const offset = Number(req.query.page) || 0; // sudah offset (paginationMiddleware)
    const kw = String(req.query.keyword || "").trim();
    const action = AKSI.includes(req.query.action) ? req.query.action : null;

    const where = {};
    if (kw) {
      where[Op.or] = [
        { user_name: { [Op.like]: `%${kw}%` } },
        { user_email: { [Op.like]: `%${kw}%` } },
      ];
    }
    if (action) where.action = action;
    if (isTanggal(req.query.dari) || isTanggal(req.query.sampai)) {
      where.createdAt = {};
      if (isTanggal(req.query.dari)) {
        where.createdAt[Op.gte] = new Date(`${req.query.dari}T00:00:00+07:00`);
      }
      if (isTanggal(req.query.sampai)) {
        where.createdAt[Op.lte] = new Date(`${req.query.sampai}T23:59:59.999+07:00`);
      }
    }

    const { count, rows } = await models.audit_log.findAndCountAll({
      where,
      order: [["id", "DESC"]],
      limit,
      offset,
      raw: true,
    });

    return res.json({
      status: "Success",
      page: req.page,
      pageSize: limit,
      data: { count, rows },
      aksi: AKSI,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "fail", msg: "Terjadi Kesalahan" });
  }
}

module.exports = { listAuditLog };
