// Audit log otomatis: setiap request POST/PUT/PATCH/DELETE dari staf yang sudah login
// dicatat satu baris setelah response selesai dikirim (res.on('finish')).
// Tidak menunda response dan tidak pernah melempar error.
// Dipasang tepat setelah jwtValidateMiddleware (butuh req.id, req.roleId, dst).
const { sanitizeData, catatAudit, infoRequest, isStaf } = require("../utils/auditLog");

const AKSI = { POST: "CREATE", PUT: "UPDATE", PATCH: "UPDATE", DELETE: "DELETE" };

const auditLogMiddleware = (req, res, next) => {
  try {
    const action = AKSI[req.method];
    if (action && req.id && isStaf(req.roleId)) pasang(req, res, action);
  } catch (e) {
    console.log("audit log gagal", e?.message);
  }
  next();
};

function pasang(req, res, action) {
  res.on("finish", () => {
    try {
      // pola route bila tersedia (mis. /guru/daftar-guru/:id/roles), selain itu URL tanpa query
      const path = req.route?.path
        ? `${req.baseUrl || ""}${req.route.path}`
        : String(req.originalUrl || req.url || "").split("?")[0];
      catatAudit({
        user_id: req.id,
        user_name: req.name,
        user_email: req.email,
        role: req.role,
        action,
        method: req.method,
        path,
        target_id: req.params?.id,
        status_code: res.statusCode,
        // body dibaca saat finish agar body multipart (multer) ikut tercatat
        data: sanitizeData(req.body),
        ...infoRequest(req),
      });
    } catch (e) {
      console.log("audit log gagal", e?.message);
    }
  });
}

module.exports = auditLogMiddleware;
