const JWT = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const UserModel = require("../models").user;
const { isAkunDiblokir, pesanAkunDiblokir } = require("../utils/statusAkun");

// Cache status akun per user (60 detik) agar akun yang diblokir (mis. pindah sekolah)
// langsung tidak bisa memakai token lamanya tanpa query DB di setiap request.
const STATUS_TTL_MS = 60 * 1000;
const statusCache = new Map();

async function getStatusAkun(userId) {
  const cached = statusCache.get(userId);
  if (cached && Date.now() - cached.at < STATUS_TTL_MS) return cached.status;
  const user = await UserModel.findByPk(userId, { attributes: ["status"], raw: true });
  const status = user?.status ?? null;
  statusCache.set(userId, { status, at: Date.now() });
  return status;
}

const clearStatusCache = (userIds = []) => userIds.forEach((id) => statusCache.delete(id));

const jwtValidateMiddleware = (req, res, next) => {
  const bearerHeader = req.headers["x-authorization"];
  if (!bearerHeader) return res.sendStatus(401);
  const bearerToken = bearerHeader.split(" ")[1];

  JWT.verify(
    bearerToken,
    process.env.JWT_SECRET_ACCESS_TOKEN,
    async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status: "fail",
          message: "Invalid Token",
          data: err,
        });
      } else {
        req.id = decoded.id;
        req.email = decoded.email;
        req.name = decoded.name;
        (req.walsan_id = decoded.walsan_id), (req.role = decoded.role);
        req.roleId = decoded.roleId;
        req.nama_siswa = decoded?.nama_siswa;
        req.StudentId = decoded?.StudentId;

        (req.semesterAktif = decoded?.semesterAktif),
          (req.tahunAjaranAktif = decoded?.tahunAjaranAktif),
          (req.teacher_id = decoded?.teacher_id);

        req.allRole = decoded.allRole;
        req.student_id = decoded.student_id;

        if (decoded.id) {
          try {
            const status = await getStatusAkun(decoded.id);
            if (isAkunDiblokir(status)) {
              return res.status(401).json({
                status: "fail",
                message: pesanAkunDiblokir(status),
                msg: pesanAkunDiblokir(status),
              });
            }
          } catch (e) {
            // Jika cek status gagal (mis. DB sibuk), jangan blokir request
            console.log("cek status akun gagal", e?.message);
          }
        }

        next();
      }
    }
  );
};

module.exports = jwtValidateMiddleware;
module.exports.clearStatusCache = clearStatusCache;
