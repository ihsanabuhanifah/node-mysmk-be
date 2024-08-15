const TempatPklModel = require("../../models").tempat_pkl;
const { RESPONSE_API } = require("../../utils/response");
const StudentModel = require("../../models").student;
const response = new RESPONSE_API();

const lokasiTempatPkl = response.requestResponse(async (req, res) => {
  const lokasi = await TempatPklModel.findOne({
    where: {
      student_id: req.student_id,
    },
    attributes: ["id", "longtitude", "latitude"],
    include: [
      {
        require: true,
        as: "siswa",
        model: StudentModel,
        attributes: ["id", "nama_siswa"],
      },
    ],
  });
  return {
    message: "Berhasil",
    data: lokasi,
  };
});

module.exports = {
  lokasiTempatPkl,
};
