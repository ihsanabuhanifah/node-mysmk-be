const { RESPONSE_API } = require("../../utils/response");
const TempatPklModel = require("../../models").tempat_pkl;

const response = new RESPONSE_API();

const createTempatPkl = response.requestResponse(async (req, res) => {
  let payload = req.body;

  const tempatPklPayload = await TempatPklModel.create({
    ...payload,
    created_by: req.teacher_id,
  });
  return {
    statusCode: 201,
    status: "success",
    message: "Registrasi Berhasil",
    data: tempatPklPayload,
  };
});

module.exports = {
  createTempatPkl,
};
