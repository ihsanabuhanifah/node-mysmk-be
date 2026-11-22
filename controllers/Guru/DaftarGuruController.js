// Daftar guru: data guru + akun + role, nonaktif/aktifkan, atur role, edit profil
const models = require("../../models");
const { sequelize } = require("../../models");
const { QueryTypes, Op } = require("sequelize");
const { STATUS_DIBLOKIR, STATUS_PINDAH_SEKOLAH } = require("../../utils/statusAkun");
const { clearStatusCache } = require("../../middleware/jwtValidateMiddleware");

// Role yang bukan role staf (tidak diatur dari Daftar Guru)
const ROLE_NON_STAF = ["Santri", "Wali Siswa", "Calon"];
const ROLE_ADMIN = ["Admin", "Super Administrator"];

// GET /guru/daftar-guru?keyword=&role_id=&status=&page=&pageSize=
//   status: "active" | "nonactive" (status guru di tabel teachers)
async function listDaftarGuru(req, res) {
  try {
    const limit = Number(req.query.pageSize) || 10;
    const offset = Number(req.query.page) || 0; // sudah offset (paginationMiddleware)
    const kw = String(req.query.keyword || "").trim();
    const roleId = Number(req.query.role_id) || null;
    const status = ["active", "nonactive"].includes(req.query.status) ? req.query.status : null;

    const where = [];
    const rep = { limit, offset };
    if (kw) {
      where.push("(t.nama_guru LIKE :kw OR u.email LIKE :kw OR u.no_hp LIKE :kw)");
      rep.kw = `%${kw}%`;
    }
    if (roleId) {
      where.push(
        "EXISTS (SELECT 1 FROM user_roles ur2 WHERE ur2.user_id = t.user_id AND ur2.role_id = :roleId)"
      );
      rep.roleId = roleId;
    }
    if (status) {
      where.push("t.status = :status");
      rep.status = status;
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const rows = await sequelize.query(
      `SELECT t.id, t.nama_guru, t.status, t.keterangan,
              u.id AS user_id, u.email, u.no_hp, u.status AS status_akun,
              GROUP_CONCAT(DISTINCT r.role_name ORDER BY r.id SEPARATOR '||') AS roles,
              GROUP_CONCAT(DISTINCT r.id ORDER BY r.id SEPARATOR ',') AS role_ids,
              (SELECT COUNT(*) FROM jadwals j WHERE j.teacher_id = t.id AND j.status = 1) AS jadwal_aktif,
              (SELECT COUNT(*) FROM halaqohs h WHERE h.teacher_id = t.id) AS halaqoh
         FROM teachers t
         LEFT JOIN users u ON u.id = t.user_id
         LEFT JOIN user_roles ur ON ur.user_id = t.user_id
         LEFT JOIN roles r ON r.id = ur.role_id
         ${whereSql}
        GROUP BY t.id, t.nama_guru, t.status, t.keterangan, u.id, u.email, u.no_hp, u.status
        ORDER BY (t.status = 'active') DESC, t.nama_guru ASC
        LIMIT :limit OFFSET :offset`,
      { type: QueryTypes.SELECT, replacements: rep }
    );

    const [{ count }] = await sequelize.query(
      `SELECT COUNT(*) AS count FROM teachers t LEFT JOIN users u ON u.id = t.user_id ${whereSql}`,
      { type: QueryTypes.SELECT, replacements: rep }
    );

    const ringkasanRole = await sequelize.query(
      `SELECT r.id, r.role_name, COUNT(DISTINCT t.id) AS jumlah
         FROM teachers t
         JOIN user_roles ur ON ur.user_id = t.user_id
         JOIN roles r ON r.id = ur.role_id
        WHERE r.role_name NOT IN (:nonStaf)
        GROUP BY r.id, r.role_name
        ORDER BY r.id`,
      { type: QueryTypes.SELECT, replacements: { nonStaf: ROLE_NON_STAF } }
    );
    const ringkasanStatus = await sequelize.query(
      `SELECT t.status, COUNT(*) AS jumlah FROM teachers t GROUP BY t.status`,
      { type: QueryTypes.SELECT }
    );
    // Semua role staf (untuk modal Atur Role)
    const roleStaf = await models.role.findAll({
      attributes: ["id", "role_name"],
      where: { role_name: { [Op.notIn]: ROLE_NON_STAF } },
      order: [["id", "ASC"]],
      raw: true,
    });

    return res.json({
      status: "Success",
      page: req.page,
      pageSize: limit,
      data: {
        count: Number(count),
        rows: rows.map((r) => ({
          ...r,
          jadwal_aktif: Number(r.jadwal_aktif),
          halaqoh: Number(r.halaqoh),
          roles: r.roles ? r.roles.split("||") : [],
          role_ids: r.role_ids ? r.role_ids.split(",").map(Number) : [],
        })),
      },
      ringkasan: { role: ringkasanRole, status: ringkasanStatus },
      roleStaf,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "fail", msg: "Terjadi Kesalahan" });
  }
}

// PUT /guru/daftar-guru/status
// body: { teacher_ids: number[], status: "active" | "nonactive", blokir_login?: boolean }
async function ubahStatusGuru(req, res) {
  const raw = req.body?.teacher_ids;
  const ids = Array.isArray(raw) ? [...new Set(raw.map(Number).filter(Boolean))] : [];
  const status = req.body?.status;
  const blokirLogin = req.body?.blokir_login !== false;

  if (ids.length === 0) {
    return res.status(422).json({ status: "fail", msg: "Pilih minimal satu guru" });
  }
  if (!["active", "nonactive"].includes(status)) {
    return res.status(422).json({ status: "fail", msg: "Status tidak valid" });
  }

  try {
    const guru = await models.teacher.findAll({
      where: { id: ids },
      attributes: ["id", "nama_guru", "user_id", "status"],
      raw: true,
    });
    if (status === "nonactive" && guru.some((g) => Number(g.user_id) === Number(req.id))) {
      return res.status(422).json({
        status: "fail",
        msg: "Anda tidak dapat menonaktifkan akun Anda sendiri",
      });
    }

    const userIds = guru.map((g) => g.user_id).filter(Boolean);
    await sequelize.transaction(async (t) => {
      await models.teacher.update({ status }, { where: { id: ids }, transaction: t });
      if (status === "nonactive" && blokirLogin && userIds.length) {
        // Jangan menimpa status "pindah"
        await models.user.update(
          { status: STATUS_DIBLOKIR },
          {
            where: { id: userIds, status: { [Op.ne]: STATUS_PINDAH_SEKOLAH } },
            transaction: t,
          }
        );
      }
      if (status === "active" && userIds.length) {
        // Buka blokir login yang dibuat lewat fitur ini
        await models.user.update(
          { status: "active" },
          { where: { id: userIds, status: STATUS_DIBLOKIR }, transaction: t }
        );
      }
    });
    clearStatusCache(userIds);

    const label = status === "active" ? "diaktifkan" : "dinonaktifkan";
    return res.json({
      status: "Success",
      msg: `${guru.length} guru berhasil ${label}${
        status === "nonactive" && blokirLogin ? " dan login akunnya diblokir" : ""
      }`,
      jumlah: guru.length,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "fail", msg: "Terjadi kesalahan, tidak ada data yang diubah" });
  }
}

// PUT /guru/daftar-guru/:id/roles   body: { role_ids: number[] }
// Mengganti role STAF guru. Role non-staf (Santri, Wali Siswa, Calon) tidak disentuh.
async function aturRoleGuru(req, res) {
  try {
    const guru = await models.teacher.findByPk(req.params.id, {
      attributes: ["id", "nama_guru", "user_id"],
    });
    if (!guru || !guru.user_id) {
      return res.status(404).json({ status: "fail", msg: "Guru tidak ditemukan" });
    }

    const roleStaf = await models.role.findAll({
      attributes: ["id", "role_name"],
      where: { role_name: { [Op.notIn]: ROLE_NON_STAF } },
      raw: true,
    });
    const stafIds = roleStaf.map((r) => r.id);
    const namaRole = (id) => roleStaf.find((r) => r.id === id)?.role_name;

    const baru = [...new Set((req.body?.role_ids || []).map(Number))].filter((id) =>
      stafIds.includes(id)
    );
    if (baru.length === 0) {
      return res.status(422).json({ status: "fail", msg: "Pilih minimal satu role" });
    }

    const pemohonSuperAdmin = (req.allRole || []).includes("Super Administrator");
    const lama = (
      await models.user_role.findAll({
        where: { user_id: guru.user_id, role_id: stafIds },
        attributes: ["role_id"],
        raw: true,
      })
    ).map((r) => r.role_id);

    // Hanya Super Administrator yang boleh memberi/mencabut role Super Administrator
    const superId = roleStaf.find((r) => r.role_name === "Super Administrator")?.id;
    if (!pemohonSuperAdmin && superId && baru.includes(superId) !== lama.includes(superId)) {
      return res.status(403).json({
        status: "fail",
        msg: "Hanya Super Administrator yang dapat mengubah role Super Administrator",
      });
    }

    // Cegah admin mencabut akses admin miliknya sendiri
    if (Number(guru.user_id) === Number(req.id)) {
      const adminLama = lama.some((id) => ROLE_ADMIN.includes(namaRole(id)));
      const adminBaru = baru.some((id) => ROLE_ADMIN.includes(namaRole(id)));
      if (adminLama && !adminBaru) {
        return res.status(422).json({
          status: "fail",
          msg: "Anda tidak dapat mencabut role Admin dari akun Anda sendiri",
        });
      }
    }

    const hapus = lama.filter((id) => !baru.includes(id));
    const tambah = baru.filter((id) => !lama.includes(id));

    await sequelize.transaction(async (t) => {
      if (hapus.length) {
        await models.user_role.destroy({
          where: { user_id: guru.user_id, role_id: hapus },
          transaction: t,
        });
      }
      for (const role_id of tambah) {
        await models.user_role.create({ user_id: guru.user_id, role_id }, { transaction: t });
      }
    });

    return res.json({
      status: "Success",
      msg: `Role ${guru.nama_guru} diperbarui. Perubahan berlaku saat guru login ulang.`,
      ditambah: tambah.map(namaRole),
      dicabut: hapus.map(namaRole),
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "fail", msg: "Terjadi kesalahan, tidak ada data yang diubah" });
  }
}

// PUT /guru/daftar-guru/:id/profil   body: { nama_guru, email, no_hp, keterangan }
async function editProfilGuru(req, res) {
  try {
    const guru = await models.teacher.findByPk(req.params.id);
    if (!guru) return res.status(404).json({ status: "fail", msg: "Guru tidak ditemukan" });

    const nama = String(req.body?.nama_guru ?? "").trim();
    const email = String(req.body?.email ?? "").trim();
    const noHp = String(req.body?.no_hp ?? "").trim();
    const keterangan = req.body?.keterangan ?? null;

    if (!nama) return res.status(422).json({ status: "fail", msg: "Nama wajib diisi" });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(422).json({ status: "fail", msg: "Email tidak valid" });
    }
    if (noHp && !/^[0-9+\-\s]{6,20}$/.test(noHp)) {
      return res.status(422).json({ status: "fail", msg: "No HP tidak valid" });
    }

    if (guru.user_id) {
      const bentrok = await models.user.findOne({
        where: { email, id: { [Op.ne]: guru.user_id } },
        attributes: ["id"],
      });
      if (bentrok) {
        return res.status(422).json({ status: "fail", msg: "Email sudah dipakai akun lain" });
      }
    }

    await sequelize.transaction(async (t) => {
      await guru.update({ nama_guru: nama, keterangan }, { transaction: t });
      if (guru.user_id) {
        await models.user.update(
          { name: nama, email, no_hp: noHp || null },
          { where: { id: guru.user_id }, transaction: t }
        );
      }
    });

    return res.json({ status: "Success", msg: "Profil guru berhasil diperbarui" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "fail", msg: "Terjadi kesalahan, tidak ada data yang diubah" });
  }
}

module.exports = { listDaftarGuru, ubahStatusGuru, aturRoleGuru, editProfilGuru };
