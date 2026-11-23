// Impor wali dari Excel: validasi per baris, NISN opsional, pratinjau tidak menyimpan.
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { mockModels, loadFresh, fakeRes, fakeTransaction } = require("./helpers/mock");

let dibuat;
let ctrl;

const SANTRI = [
  { id: 110, nama_siswa: "Hilmi", nisn: "84166061" },
  { id: 9, nama_siswa: "Ahmad", nisn: "0065554315" },
];

beforeEach(() => {
  dibuat = { user: [], user_role: [], parent: [] };
  const buatModel = (nama) => ({
    async create(data) {
      const row = { id: dibuat[nama].length + 100, ...data };
      dibuat[nama].push(row);
      return row;
    },
  });
  mockModels({
    sequelize: { transaction: fakeTransaction, literal: (s) => s },
    user: {
      ...buatModel("user"),
      findAll: async ({ where }) => [{ email: "sudah@ada.id" }].filter((u) => where.email.includes(u.email)),
    },
    user_role: buatModel("user_role"),
    parent: buatModel("parent"),
    student: { findAll: async ({ where }) => SANTRI.filter((s) => where.nisn.includes(s.nisn)) },
    kelas_student: { findAll: async () => [] },
  });
  ctrl = loadFresh("controllers/Guru/AdminWaliController.js");
});

const impor = async (rows, simpan) => {
  const res = fakeRes();
  await ctrl.importWali({ body: { rows, simpan } }, res);
  return res;
};

const BARIS = [
  { nama_wali: "Wali Satu", email: "satu@test.id", hubungan: "Ayah", nisn: "84166061" }, // terhubung
  { nama_wali: "Wali Dua", email: "dua@test.id", hubungan: "ibu", nisn: "65554315", no_hp: "81234567890" }, // 0 depan hilang
  { nama_wali: "Wali Tiga", email: "tiga@test.id", hubungan: "wali", nisn: "" }, // tanpa NISN -> menunggu
  { nama_wali: "Wali Empat", email: "sudah@ada.id", hubungan: "ayah", nisn: "84166061" }, // email terpakai
  { nama_wali: "", email: "bukan-email", hubungan: "paman" }, // banyak error
];

test("pratinjau: validasi per baris tanpa menyimpan apa pun", async () => {
  const res = await impor(BARIS, false);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.ringkasan, { total: 5, valid: 3, terhubung: 2, gagal: 2, menunggu: 1 });
  assert.equal(dibuat.user.length, 0, "pratinjau tidak boleh membuat akun");

  const [b1, b2, b3, b4, b5] = res.body.data;
  assert.equal(b1.siswa.id, 110);
  assert.equal(b2.siswa.id, 9, "NISN tanpa angka 0 di depan tetap cocok");
  assert.equal(b2.no_hp, "081234567890", "angka 0 di depan nomor HP dipulihkan");
  assert.equal(b3.valid, true);
  assert.equal(b3.siswa, null);
  assert.match(b3.peringatan[0], /NISN kosong/);
  assert.deepEqual(b4.error, ["Email sudah dipakai akun lain"]);
  assert.ok(b5.error.length >= 3);
});

test("email ganda di dalam file ditolak", async () => {
  const res = await impor(
    [
      { nama_wali: "A", email: "x@test.id", hubungan: "ayah" },
      { nama_wali: "B", email: "X@test.id", hubungan: "ibu" },
    ],
    false
  );
  assert.equal(res.body.ringkasan.valid, 0);
  res.body.data.forEach((r) => assert.ok(r.error.includes("Email ganda di file")));
});

test("simpan: hanya baris valid yang dibuat, password acak & tidak disimpan mentah", async () => {
  const res = await impor(BARIS, true);
  assert.equal(res.body.ringkasan.dibuat, 3);
  assert.equal(res.body.ringkasan.terhubung, 2);
  assert.equal(dibuat.user.length, 3);
  assert.equal(dibuat.user_role.every((r) => r.role_id === 8), true, "role selalu Wali Siswa");

  const hasil = res.body.data.filter((r) => r.dibuat);
  hasil.forEach((r, i) => {
    assert.ok(r.password && r.password.length >= 10);
    assert.notEqual(dibuat.user[i].password, r.password, "password disimpan dalam bentuk hash");
  });
  const tanpaSantri = dibuat.parent.find((p) => p.nama_wali === "Wali Tiga");
  assert.equal(tanpaSantri.student_id, null, "tanpa NISN -> status menunggu dihubungkan");
});

test("lebih dari 500 baris ditolak", async () => {
  const rows = Array.from({ length: 501 }, (_, i) => ({ nama_wali: "A", email: `a${i}@t.id`, hubungan: "ayah" }));
  const res = await impor(rows, false);
  assert.equal(res.statusCode, 422);
});
