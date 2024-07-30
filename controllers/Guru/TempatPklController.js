const TempatPklModel = require("../../models").tempat_pkl;

async function createTempatPkl(req, res) {
  let payload = req.body;
  try {
    const tempatPklPayload = await TempatPklModel.create({
      ...payload,
      created_by: req.teacher_id,
    });
    return res.status(201).json({
      status: "success",
      message: "Registrasi Berhasil",
      data: tempatPklPayload,
    });
  } catch (error) {
    console.log(err);
  }
}
