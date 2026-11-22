const fs = require("fs");

// Dipakai setelah multer: cek password import, hapus file upload bila salah
// (folder uploads disajikan publik via express.static, jadi file tidak boleh tertinggal)
const checkImportPasswordMiddleware = (req, res, next) => {
  if (req.body?.password !== process.env.IMPORT_PASSWORD) {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ msg: "Password Import Salah" });
  }
  next();
};

module.exports = checkImportPasswordMiddleware;
