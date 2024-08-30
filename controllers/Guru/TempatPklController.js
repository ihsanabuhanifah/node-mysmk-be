const { where } = require("sequelize");
const { RESPONSE_API } = require("../../utils/response");
const TempatPklModel = require("../../models").tempat_pkl;
const StudentModel = require("../../models").student;
const TeacherModel = require("../../models").teacher;
const response = new RESPONSE_API();
const models = require("../../models");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const createTempatPkl = response.requestResponse(async (req, res) => {
  let payload = req.body;

  const tempatPklPayload = await TempatPklModel.create({
    ...payload,
    created_at: new Date(),
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
  await TempatPklModel.update(
    {
      ...payload,
      updated_at: new Date(),
    },
    {
      where: {
        id: id,
      },
    }
  );
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
  console.log("Executing Query:", TempatPklModel.findAndCountAll.toString());
  const tempatPkl = await TempatPklModel.findOne({
    where: {
      id: id,
    },
    include: [
      {
        require: true,
        as: "siswa",
        model: StudentModel,
        attributes: ["nama_siswa"],
      },
      {
        model: TeacherModel,
        require: true,
        as: "teacher",
        attributes: ["nama_guru"],
      },
      {
        model: TeacherModel,
        require: true,
        as: "pembimbing",
        attributes: ["nama_guru"],
      },
    ],
  });

  return {
    message: `Berhasil menemukan data dengan id ${id}`,
    data: tempatPkl,
  };
});

const listTempatPkl = response.requestResponse(async (req, res) => {
  let { page, pageSize } = req.query;

  const { rows, count } = await TempatPklModel.findAndCountAll({
    limit: pageSize,
    offset: page,
    include: [
      {
        require: true,
        as: "siswa",
        model: StudentModel,
        attributes: ["nama_siswa"],
      },
      {
        model: TeacherModel,
        require: true,
        as: "teacher",
        attributes: ["nama_guru", "id"],
      },
      {
        model: TeacherModel,
        require: true,
        as: "pembimbing",
        attributes: ["nama_guru", "id"],
      },
    ],
  });

  return {
    message: "Berhasil",
    data: rows,
    pagination: {
      totalItems: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: page,
      pageSize: pageSize,
    },
  };
});

const createBulkExcel = async (req, res) => {
  console.log("rawr");
  if (req.file == undefined) {
    return res.status(400).json({
      statusCode: 400,
      msg: "Upload File Excel",
    });
  }

  let path = "public/data/uploads/" + req.file.filename;
  console.log("rawr111");

  readXlsxFile(path).then(async (rows) => {
    console.log("rawrdddddddddddaaaaaaaaaad");

    rows.shift();
    console.log("rawrdddddddddssssss");

    let data = [];
    console.log("rddddddddawr");

    for (let row of rows) {
      console.log("rawrdddddda3333333dddd");

      const student = await StudentModel.findOne({
        where: { nama_siswa: row[11] },
      });

      const pembimbing = await TeacherModel.findOne({
        where: { nama_guru: row[12] },
      });
      console.log("ini row1", row[1]);
      console.log("ini row2", row[2]);
      console.log("ini row3", row[3]);
      console.log("ini row4", row[4]);
      console.log("ini row5", row[5]);
      console.log("ini row6", row[6]);
      console.log("ini row7", row[7]);
      console.log("ini row8", row[8]);
      console.log("ini row 9", row[9]);
      console.log("ini row 10", row[10]);
      console.log("ini row 11", row[11]);
      console.log("ini namas siswa", row[12]);
      console.log("ini namas guru", row[13]);
      console.log("ini", student);
      console.log("ini", pembimbing);
      console.log("r2222222addddddddawrddddddddd");

      const payload = {
        nama_perusahaan: row[0],
        kota: row[1],
        kecamatan: row[2],
        alamat: row[3],
        provinsi: row[4],
        desa: row[5],
        rt: row[6],
        rw: row[7],
        no_hp: row[8],
        kode_pos: row[9],
        penanggung_jawab_perusahaan: row[10],
        student_id: student.id,
        pembimbing_id: pembimbing.id,
        longtitude: row[13],
        latitude: row[14],
        created_by: req.teacher_id,
        created_at: new Date(),
      };
      console.log("111111rawrddddddddd");

      data.push(payload);
    }
    console.log("66666666rawrddddddddd");

    fs.unlinkSync(path);
    console.log("77777777rawrddddddddd");

    await TempatPklModel.bulkCreate(data);
    console.log("r9999999 awrddddddddd");

    return res.json({
      status: "success",
      message: "Data Berhasil Diupload",
      data: data,
    });
  });
};

module.exports = {
  createTempatPkl,
  updateTempatPkl,
  deteleTempatPkl,
  detailTempatPkl,
  listTempatPkl,
  createBulkExcel,
};
