const roleModel = require("../../models").role;
const alquranModel = require("../../models").alquran;
const taModel = require("../../models").ta;
const mapelModel = require("../../models").mapel;
const kelasModel = require("../../models").kelas;
const JadwalModel = require("../../models").jadwal;
const daftarPelanggaranModel = require("../../models").daftar_pelanggaran;
const RombelModel = require("../../models").kelas_student;
const fs = require("fs");
const readXlsxFile = require("read-excel-file/node");

const dotenv = require("dotenv");
const path = require("path");
dotenv.config();
async function importRoles(req, res) {
  try {
    if (req.file == undefined) {
      return res.status(400).json({
        msg: "Upload File Excel",
      });
    }

    let password = process.env.IMPORT_PASSWORD;

    if (password !== req.body.password) {
      return res.status(400).json({
        msg: "Password Import Salah",
      });
    }
    let path = "public/data/uploads/" + req.file.filename;
    readXlsxFile(path).then(async (rows) => {
      rows.shift();
      let roles = [];

      rows.forEach((row) => {
        const role = {
          id: row[0],
          role_name: row[1],
          remarks: row[2],
        };
        roles.push(role);
      });

      fs.unlinkSync(path);
      console.log(roles);
      await Promise.all(
        roles.map(async (role) => {
          if (role.id !== null) {
            await roleModel.create(role);
          }
        })
      );
      res.json({
        status: "Success",
        msg: "import Roles berhasil",
      });
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

async function importTa(req, res) {
  try {
    if (req.file == undefined) {
      return res.status(400).json({
        msg: "Upload File Excel",
      });
    }

    let password = process.env.IMPORT_PASSWORD;

    if (password !== req.body.password) {
      return res.status(400).json({
        msg: "Password Import Salah",
      });
    }
    let path = "public/data/uploads/" + req.file.filename;
    readXlsxFile(path).then(async (rows) => {
      rows.shift();
      let tas = [];

      rows.forEach((row) => {
        const ta = {
          id: row[0],
          nama_tahun_ajaran: row[1],
        };
        tas.push(ta);
      });

      fs.unlinkSync(path);

      await Promise.all(
        tas.map(async (ta) => {
          if (ta.id !== null) {
            await taModel.create(ta);
          }
        })
      );
      res.json({
        status: "Success",
        msg: "import Tahun Ajaran berhasil",
      });
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}
async function importMapel(req, res) {
  try {
    if (req.file == undefined) {
      return res.status(400).json({
        msg: "Upload File Excel",
      });
    }

    let password = process.env.IMPORT_PASSWORD;

    console.log("msuk sini");

    if (password !== req.body.password) {
      return res.status(400).json({
        msg: "Password Import Salah",
      });
    }
    let path = "public/data/uploads/" + req.file.filename;
    readXlsxFile(path).then(async (rows) => {
      rows.shift();
      let mapels = [];

      rows.forEach((row) => {
        const mapel = {
          nama_mapel: row[1],
          kategori: row[2],
        };
        mapels.push(mapel);
      });

      fs.unlinkSync(path);

      console.log("maoel", mapels);
      await Promise.all(
        mapels.map(async (mapel) => {
          if (mapel.id !== null) {
            await mapelModel.create(mapel);
          }
        })
      );
      res.json({
        status: "Success",
        msg: "import Mata Pelajaran berhasil",
      });
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}
async function importKelas(req, res) {
  try {
    if (req.file == undefined) {
      return res.status(400).json({
        msg: "Upload File Excel",
      });
    }

    let password = process.env.IMPORT_PASSWORD;

    if (password !== req.body.password) {
      return res.status(400).json({
        msg: "Password Import Salah",
      });
    }
    let path = "public/data/uploads/" + req.file.filename;
    readXlsxFile(path).then(async (rows) => {
      rows.shift();
      let tas = [];

      rows.forEach((row) => {
        const ta = {
          id: row[0],
          nama_kelas: row[1],
          tahun_ajaran: row[2],
        };
        tas.push(ta);
      });

      fs.unlinkSync(path);

      await Promise.all(
        tas.map(async (ta) => {
          if (ta.id !== null) {
            await kelasModel.create(ta);
          }
        })
      );
      res.json({
        status: "Success",
        msg: "import Kelas berhasil",
      });
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

async function importAlquran(req, res) {
  try {
    if (req.file == undefined) {
      return res.status(400).json({
        msg: "Upload File Excel",
      });
    }

    let password = process.env.IMPORT_PASSWORD;

    if (password !== req.body.password) {
      return res.status(400).json({
        msg: "Password Import Salah",
      });
    }
    let path = "public/data/uploads/" + req.file.filename;
    readXlsxFile(path).then(async (rows) => {
      rows.shift();
      let mapels = [];

      rows.forEach((row) => {
        const mapel = {
          id: row[0],
          nama_surat: row[1],
          nama_surat_arabic: row[2],
          jumlah_ayat: row[3],
        };
        mapels.push(mapel);
      });

      fs.unlinkSync(path);

      await Promise.all(
        mapels.map(async (mapel) => {
          if (mapel.id !== null) {
            await alquranModel.create(mapel);
          }
        })
      );
      res.json({
        status: "Success",
        msg: "import Alquran berhasil",
      });
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

async function importJadwal(req, res) {
  try {
    if (req.file == undefined) {
      return res.status(400).json({
        msg: "Upload File Excel",
      });
    }

    let password = process.env.IMPORT_PASSWORD;

    if (password !== req.body.password) {
      return res.status(400).json({
        msg: "Password Import Salah",
      });
    }
    let path = "public/data/uploads/" + req.file.filename;
    readXlsxFile(path).then(async (rows) => {
      rows.shift();
      let jadwals = [];

      rows.forEach((row) => {
        const jadwal = {
          hari: row[1],
          kelas_id: row[2],
          teacher_id: row[3],
          mapel_id: row[4],
          jam_ke: row[5],
          semester: row[6],
          ta_id: row[7],
          status: row[8],
          jumlah_jam: row[9],
        };
        jadwals.push(jadwal);
      });

      console.log(jadwals);
      fs.unlinkSync(path);

      await Promise.all(
        jadwals.map(async (jadwal) => {
          if (jadwal.id !== null) {
            await JadwalModel.create(jadwal);
          }
        })
      );
      res.json({
        status: "Success",
        msg: "Jadwal Berhasil dibuat",
      });
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}
async function importRombel(req, res) {
  try {
    if (req.file == undefined) {
      return res.status(400).json({
        msg: "Upload File Excel",
      });
    }

    let password = process.env.IMPORT_PASSWORD;

    if (password !== req.body.password) {
      return res.status(400).json({
        msg: "Password Import Salah",
      });
    }
    let path = "public/data/uploads/" + req.file.filename;
    readXlsxFile(path).then(async (rows) => {
      rows.shift();
      let rombels = [];

      rows.forEach((row) => {
        const rombel = {
          kelas_id: row[1],
          student_id: row[2],
          semester: row[3],
          ta_id: row[4],
          status: row[5],
        };
        rombels.push(rombel);
      });

      console.log(rombels);
      fs.unlinkSync(path);

      await Promise.all(
        rombels.map(async (rombel) => {
          if (rombel.id !== null) {
            await RombelModel.create(rombel);
          }
        })
      );
      res.json({
        status: "Success",
        msg: "Rombel Berhasil dibuat",
      });
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

async function uploadImage(req, res) {
  try {
    if (req.file == undefined) {
      return res.status(400).json({
        msg: "Upload File Excel",
      });
    }

    console.log("req", req.file);

    // let target = path.join(__dirname, "public/data/uploads/", req.file.filename);
    // fs.renameSync(req.path, target);
    url = `${req.protocol}://${req.get("host")}/${req.file.filename}`;
    res.json({
      status: "Success",
      msg: "Rombel Berhasil dibuat",
      url: url,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}
module.exports = {
  importRoles,
  importAlquran,
  importTa,
  importMapel,
  importKelas,
  importJadwal,
  uploadImage,
  importRombel,
};
