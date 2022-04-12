const PrestasiModel = require("../../models").prestasi;
const StudentModel = require("../../models").student;
const TeacherModel = require("../../models").teacher;
const AbsensiSholatModel = require("../../models").absensi_sholat;
const TaModel = require("../../models").ta;
const models = require("../../models");
const { Op } = require("sequelize");
const { checkQuery } = require("../../utils/format");

const listAbsensiSholat = async (req, res) => {
  let { nama_siswa,page, pageSize } = req.query;
  try {
    const pelanggaran = await AbsensiSholatModel.findAndCountAll({
      //   attributes: ["id", "tanggal", "status", "tindakan", "semester"],
      ...(pageSize !== undefined && { limit: pageSize }),
      ...(page !== undefined && { offset: page }),
      include: [
        {
          model: StudentModel,
          require: true,
          as: "siswa",
          attributes: ["id", "nama_siswa"],
          where: {
            ...(checkQuery(nama_siswa) && {
              nama_siswa: {
                [Op.substring]: nama_siswa,
              },
            }),
          },
        },
        {
          model: TeacherModel,
          require: true,
          as: "guru",
          attributes: ["id", "nama_guru"],
        },

        // {
        //   model: TaModel,
        //   require: true,
        //   as: "tahun_ajaran",
        //   attributes: ["id", "nama_tahun_ajaran"],
        // },
      ],
      order: [["id", "desc"]],
    });
    return res.json({
      status: "Success",
      page: req.page,
      pageSize: pageSize,
      data: pelanggaran,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};
const detailPrestasi = async (req, res) => {
  return res.send("ok");
};

const deleteAbsensiSholat = async (req, res) => {
    try {
        const { payload } = req.body;
    
       
        let count = 0;
        await Promise.all(
          payload.map(async (data) => {
            const hapus = await AbsensiSholatModel.destroy({
              where: {
                id: data,
              },
            });
            if (hapus) {
              count = count + 1;
            }
          })
        );
    
        return res.json({
          status: "Success",
          msg: `${count} data berhasil terhapus`,
        });
      } catch (err) {
        console.log(err);
        return res.status(403).json({
          status: "Fail",
          msg: "Terjadi Kesalahan",
        });
      }
};

const createAbsensiSholat = async (req, res) => {
  try {
    const { payload } = req.body;

    let berhasil = 0;
    let gagal = 0;

    await Promise.all(
      payload.map(async (data) => {
        try {
          const create = await AbsensiSholatModel.create({
            student_id: data.student_id,
            tanggal: data.tanggal,
            waktu : data.waktu,
            alasan:data.alasan,
            keterangan : data.keterangan,
            created_by: req.teacher_id,
           
          });
          if (create) {
            berhasil = berhasil + 1;
          } else {
            gagal = gagal + 1;
          }
        } catch {
          gagal = gagal + 1;
        }
      })
    );

    return res.json({
      status: "Success",
      berhasil,
      gagal,
      msg: `${berhasil} data ditambahkan dan ${gagal} gagal`,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};
const updateAbensiSholat = async (req, res) => {
  try {
    const { payload } = req.body;

    const data = await AbsensiSholatModel.findOne({
      where: {
        id: payload.id,
        
      },
    });

    if (!data) {
      return res.status(422).json({
        status: "Fail",
        msg: "Anda tidak meiliki Akses untuk merubah data ini",
       
      });
    }
    await AbsensiSholatModel.update(payload, {
      where: {
        id: payload.id,
       
      },
    });

    return res.json({
      status: "Success",
      msg: "Data berhasil diperharui",
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
      error: err,
    });
  }
};

module.exports = { createAbsensiSholat, listAbsensiSholat, updateAbensiSholat, deleteAbsensiSholat };
