const KelasStudentModel = require("../../models").kelas_student;
const StudentModel = require("../../models").student;
const TahunAjaranModel = require("../../models").ta;
const models = require("../../models");
const { Op, where } = require("sequelize");
const UserModel = require("../../models").user;
const { checkQuery } = require("../../utils/format");
const excel = require("exceljs");
const { RESPONSE_API } = require("../../utils/response");
const response = new RESPONSE_API();

const mapelModel = require("../../models").mapel;
const nilaiModel = require("../../models").nilai;
const hasilBelajarModel = require("../../models").hasil_belajar;
const ujianModel = require("../../models").ujian;

const getGrade = (nilai) => {
  if (nilai === null) return "-";
  if (nilai >= 90) return "A+";
  if (nilai >= 80) return "A";
  if (nilai >= 70) return "B+";
  if (nilai >= 60) return "B";
  if (nilai >= 50) return "C+";
  if (nilai >= 40) return "C";
  if (nilai >= 30) return "D+";
  return "D";
};

async function listSiswa(req, res) {
  let {
    nama_kelas,
    nama_siswa,
    keyword,
    tahun_ajaran,
    status,
    kelas_id,
    page,
    pageSize,
  } = req.query;
  try {
    const siswa = await KelasStudentModel.findAndCountAll({
      where: {
        ...(checkQuery(status) && {
          status: status,
        }),
        ...(checkQuery(kelas_id) && {
          kelas_id: Number(kelas_id),
        }),
      },
      distinct: true,
      order: [
        [{ model: models.kelas, as: "kelas" }, "nama_kelas", "ASC"],
        [{ model: models.student, as: "siswa" }, "nama_siswa", "ASC"],
      ],
      limit: pageSize,
      offset: page,
      include: [
        {
          model: models.kelas,
          require: true,
          as: "kelas",
          attributes: ["id", "nama_kelas"],
          where: {
            ...(checkQuery(nama_kelas) && {
              nama_kelas: {
                [Op.substring]: nama_kelas,
              },
            }),
          },
        },
        {
          model: models.student,
          require: true,
          as: "siswa",
          include: [
            {
              model: models.user,
              require: true,
              as: "user",
              attributes: ["id", "email"],
            },
          ],
          //   attributes: ["id", "nama_siswa"],
          where: {
            ...(checkQuery(nama_siswa) && {
              nama_siswa: {
                [Op.substring]: nama_siswa,
              },
            }),
            ...(checkQuery(keyword) && {
              nama_siswa: {
                [Op.substring]: keyword,
              },
            }),
          },
        },

        {
          model: models.ta,
          require: true,
          as: "tahun_ajaran",
          attributes: ["id", "nama_tahun_ajaran"],

          where: {
            ...(checkQuery(tahun_ajaran) && {
              nama_tahun_ajaran: {
                [Op.substring]: tahun_ajaran,
              },
            }),
          },
        },
      ],
    });

    return res.json({
      status: "Success",
      msg: "Daftar Siswa ditemukan",
      page: req.page,
      pageSize: pageSize,
      data: siswa,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

async function createSiswaKelas(req, res) {
  let { data } = req.body;
  try {
    await KelasStudentModel.bulkCreate(data);
    return res.json({
      status: "Success",
      msg: "Jadwal Berhasil ditambahkan",
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

const deleteSiswaKelas = async (req, res) => {
  try {
    const { id } = req.params;
    await KelasStudentModel.destroy({
      where: {
        id: id,
      },
    });

    return res.json({
      status: "Success",
      msg: `data berhasil terhapus`,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const detailSiswa = response.requestResponse(async (req, res) => {
  const { id } = req.params;
  const siswa = await StudentModel.findOne({
    where: {
      id,
    },

    include: [
      {
        model: models.user,
        require: true,
        as: "user",
      },
    ],
  });

  if (!siswa) {
    return {
      statusCode: 422,
      msg: "Siswa tidak ditemukan",
    };
  }

  return {
    msg: "Berhasil",
    siswa,
  };
});

const updateSiswa = response.requestResponse(async (req, res) => {
  const { id } = req.params;
  const body = req.body || {};

  // string kosong dari form -> null (kolom DATETIME / INT menolak '')
  const val = (v) =>
    v === undefined ? undefined : v === null || String(v).trim() === "" ? null : v;

  const siswa = await StudentModel.findByPk(id);
  if (!siswa) {
    return { statusCode: 422, msg: "Siswa tidak ditemukan" };
  }

  const nama_siswa = val(body.nama_siswa);
  const email = val(body.email);
  if (!nama_siswa) return { statusCode: 422, msg: "Nama siswa wajib diisi" };
  if (!email) return { statusCode: 422, msg: "Email wajib diisi" };

  const emailDipakai = await UserModel.findOne({
    where: { email, id: { [Op.ne]: siswa.user_id } },
  });
  if (emailDipakai) {
    return { statusCode: 422, msg: "Email sudah dipakai akun lain" };
  }

  const dataSiswa = {
    nama_siswa,
    nis: val(body.nis),
    nisn: val(body.nisn),
    nik: val(body.nik),
    tempat_lahir: val(body.tempat_lahir),
    tanggal_lahir: val(body.tanggal_lahir),
    jenis_kelamin: val(body.jenis_kelamin),
    anak_ke: val(body.anak_ke),
    alamat: val(body.alamat),
    sekolah_asal: val(body.sekolah_asal),
    tanggal_diterima: val(body.tanggal_diterima),
    angkatan: val(body.angkatan),
    tahun_ajaran: val(body.tahun_ajaran),
    // status & keterangan hanya diubah bila dikirim (form lama)
    ...(body.status ? { status: body.status } : {}),
    ...(body.keterangan !== undefined ? { keterangan: val(body.keterangan) } : {}),
  };
  // field yang tidak dikirim sama sekali tidak ikut diubah
  Object.keys(dataSiswa).forEach((k) => dataSiswa[k] === undefined && delete dataSiswa[k]);

  await models.sequelize.transaction(async (transaction) => {
    // user diambil dari data siswa, bukan dari body (cegah mengubah akun lain)
    await UserModel.update(
      { name: nama_siswa, email },
      { where: { id: siswa.user_id }, transaction }
    );
    await StudentModel.update(dataSiswa, { where: { id }, transaction });
  });

  return {
    msg: "Perbaharui data siswa berhasil",
  };
});

// task rizky
const getHasilBelajar = async (req, res) => {
  let { id } = req.params;
  let { nama_mapel, page, pageSize, ta_id } = req.query;

  console.log("ini dia", req.query);

  const result = await mapelModel.findAll({
    attributes: {
      exclude: "mapel_id",
      include: ["id"],
    },
    where: {
      ...(checkQuery(nama_mapel) && {
        nama_mapel,
      }),
    },
    limit: pageSize,
    offset: page,
    include: [
      {
        model: hasilBelajarModel,
        require: true,
        as: "hasil_belajar",
        where: {
          ...(checkQuery(ta_id) && {
            ta_id,
          }),
          student_id: id,
        },
        include: [
          {
            model: TahunAjaranModel,
            require: true,
            as: "tahun_ajaran",
          },
        ],
      },
    ],
  });

  if (result.length === 0) {
    return res.json({
      status: "Gagal medapatkan data",
      data: null,
    });
  }

  result.forEach((mapel) => {
    mapel.hasil_belajar.forEach((hasil) => {
      hasil.dataValues.grade = getGrade(hasil.nilai);
    });
  });

  return res.json({
    status: "Success",
    data: result,
    page,
    pageSize,
  });
};

const detailHasilBelajar = async (req, res) => {
  const { id, id_siswa } = req.params;

  console.log(req.params);

  const result = await nilaiModel.findAll({
    where: { mapel_id: id, student_id: id_siswa },
    include: [
      {
        model: mapelModel,
        as: "mapel",
        attributes: ["nama_mapel", "kategori"],
      },
      {
        model: ujianModel,
        as: "ujian",
      },
      {
        model: TahunAjaranModel,
        as: "tahun_ajaran",
      },
    ],
  });

  if (result.length === 0) {
    return res.json({
      status: "Gagal mendapatkan data",
      data: null,
    });
  }

  return res.json({
    status: "Success",
    data: result,
  });
};

module.exports = {
  listSiswa,
  createSiswaKelas,
  deleteSiswaKelas,
  detailSiswa,
  updateSiswa,
  getHasilBelajar,
  detailHasilBelajar,
};