const { where } = require("sequelize");
const { RESPONSE_API } = require("../../utils/response");
const TempatPklModel = require("../../models").tempat_pkl;
const StudentModel = require("../../models").student;
const TeacherModel = require("../../models").teacher;
const response = new RESPONSE_API();
const models = require("../../models");

const createTempatPkl = response.requestResponse(async (req, res) => {
  let payload = req.body;

  const tempatPklPayload = await TempatPklModel.create({
    ...payload,
    created_by: req.teacher_id,
  });
  return {
    statusCode: 201,
    status: "success",
    message: "Data Berhasil Diupload",
    data: tempatPklPayload,
  };
});

const updateTempatPkl = response.requestResponse(async (req, res) => {
  const { id } = req.params;
  let payload = req.body;
  const tempatPkl = await TempatPklModel.findOne({
    where: {
      id: id,
    },
  });
  if (tempatPkl === null) {
    return res.status(422).json({
      status: "Fail",
      msg: `Tempat pkl dengan id ${id} tidak dapat Ditemukan`,
    });
  }
  await TempatPklModel.update(payload, {
    where: {
      id: id,
    },
  });
  return {
    statusCode: 201,
    message: `Data dengan id ${id} Berhasil Di Update`,
    data: req.body,
  };
});

const deteleTempatPkl = response.requestResponse(async (req, res) => {
  const { id } = req.params;
  const tempatPkl = await TempatPklModel.findOne({
    where: {
      id: id,
    },
  });
  if (tempatPkl === null) {
    return res.status(422).json({
      status: "Fail",
      msg: `Tempat pkl dengan id ${id} tidak dapat Ditemukan`,
    });
  }
  await TempatPklModel.destroy({
    where: {
      id: id,
    },
  });
  return {
    message: `Berhasil mengahpus data dengan id ${id}`,
    data: tempatPkl,
  };
});

const detailTempatPkl = response.requestResponse(async (req, res) => {
  const { id } = req.params;
  const tempatPkl = await TempatPklModel.findOne({
    where: {
      id: id,
    },
  });
  return {
    message: `Berhasil menemukan data dengan id ${id}`,
    data: tempatPkl,
  };
});

const listTempatPkl = response.requestResponse(async (req, res) => {
  let { page = 1, pageSize = 10 } = req.query;

  page = parseInt(page);
  pageSize = parseInt(pageSize);

  const offset = (page - 1) * pageSize;

  const { count, rows } = await TempatPklModel.findAndCountAll({
    limit: pageSize,
    offset: offset,
    include: [
      {
        require : true,
        as : "siswa",
        model: StudentModel,
        attributes: ['nama_siswa'], 
      },
      {
        model: TeacherModel,
        require : true,
        as : "teacher",
        attributes: ['nama_guru'], 
      },
    ],
  });

  const totalPages = Math.ceil(count / pageSize);

  return {
    message: "Berhasil",
    data: rows,
    pagination: {
      totalItems: count,
      totalPages: totalPages,
      currentPage: page,
      pageSize: pageSize,
    },
  };
});

module.exports = {
  createTempatPkl,
  updateTempatPkl,
  deteleTempatPkl,
  detailTempatPkl,
  listTempatPkl
};
