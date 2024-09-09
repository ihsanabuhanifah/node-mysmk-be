const studentModel = require("../../models").student;
const models = require("../../models");
const { RESPONSE_API } = require("../../utils/response");
const ModelUser = require("../../models").user;
const ParentController = require("../../models").parent;


const response = new RESPONSE_API();

const getListWali = response.requestResponse(async (req, res) => {
  const { page, pageSize } = req.query;
  const wali = await ParentController.findAndCountAll({
    ...(pageSize !== undefined && { limit: pageSize }),
    ...(page !== undefined && { offset: page }),
  
   
    include: [
      {
        model: models.student,
        require: true,
        as: "siswa",
        attributes: ["id", "nama_siswa"],
      },
      {
        model: models.user,
        require: true,
        as: "wali",
        attributes: [
          "id",
          "name",
          "email",
         
        ],
      },
    ],
    order: [["id", "desc"]],
    limit: pageSize,
    offset: page,
  });

  return {
    msg: "Data Wali Santri berhasil ditemukan",
    data: wali,
    limit: pageSize,
    offset: page,

    page: req.page,
    pageSize: pageSize,
  };
});

const createBulkWali = async (req, res) => {
  try {
    const {payload} = req.body;

    let gagal = 0;
    let berhasil = 0;

    await Promise.all(
      payload.map(async (data) => {
        try {
          const buat = await ParentController.create({
            nama_wali: data.nama_wali,
            user_id: req.user_id,
            student_id: data.student_id,
            hubungan: data.hubungan
          })
          if (buat) {
            berhasil = berhasil + 1
          } else {
            gagal = gagal + 1
          }
        } catch (error) {
          gagal = gagal + 1
        }
      })
    );

    return res.json({
      status: "Success",
      berhasil,
      gagal,
      msg: `${berhasil} data ditambahkan dan ${gagal} gagal`
    })
  } catch (error) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}



module.exports = { getListWali, createBulkWali};
