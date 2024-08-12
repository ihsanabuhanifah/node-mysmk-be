const mitraSekolah = require("../../models").mitraSekolah;
const uploadFoto = require("../../utils/multer");
const cloudinary = require("../../config/cloudinary");
const createMitraSekolah = async (req, res) => {
  // uploadFoto.single("foto")(req, res, async (err) => {
  //   if (err) {
  //     return res.status(400).json({
  //       status: "fail",
  //       message: err,
  //     });
  //   }
  //   try {
  //     const imgUrl = req.file.path;
  //     const newMitraSekolah = await mitraSekolah.create({ imgUrl });
  //     return res.status(201).json({
  //       status: "success",
  //       message: "Mitra Sekolah berhasil di-upload",
  //       data: newMitraSekolah,
  //     });
  //   } catch (err) {
  //     console.log(err);
  //     return res.status(500).json({
  //       status: "fail",
  //       message: "Terjadi Kesalahan",
  //     });
  //   }
  // });
  const upload = await cloudinary.uploader
    .upload(req.file.path, {
      folder: "ppdb",
    })
    .catch((e) => {
      console.log(e);
    });
  console.log(upload);
};
module.exports = {
  createMitraSekolah,
};
