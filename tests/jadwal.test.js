// Tambah jadwal: validasi isian & cek bentrok (kelas maupun guru).
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { rapikanJadwal, cekBentrok, tumpang } = require("../utils/jadwal");

const dasar = { hari: "Senin", kelas_id: 1, semester: 1, ta_id: 5 };
const baris = (jam_ke, jumlah_jam, teacher_id = 10, mapel_id = 20, extra = {}) => ({ ...dasar, jam_ke, jumlah_jam, teacher_id, mapel_id, ...extra });

test("rentang jam tumpang tindih", () => {
  assert.equal(tumpang({ jam_ke: 1, jumlah_jam: 2 }, { jam_ke: 2, jumlah_jam: 1 }), true);
  assert.equal(tumpang({ jam_ke: 1, jumlah_jam: 2 }, { jam_ke: 3, jumlah_jam: 2 }), false);
});

test("isian dirapikan: hari huruf kecil, hanya kolom jadwal, status aktif", () => {
  const { rows, errors } = rapikanJadwal([{ ...baris(1, 2), id: 999, created_by: "x" }]);
  assert.deepEqual(errors, []);
  assert.equal(rows[0].hari, "senin");
  assert.equal(rows[0].status, 1);
  assert.equal(rows[0].id, undefined, "kolom asing dibuang");
});

test("isian kosong ditolak per baris", () => {
  const { errors } = rapikanJadwal([baris(1, 2), { hari: "senin", kelas_id: 1 }]);
  assert.equal(errors.length, 1);
  assert.equal(errors[0].baris, 2);
  assert.match(errors[0].pesan, /teacher_id/);
});

test("baris baru saling bertabrakan di kelas yang sama", () => {
  const { rows } = rapikanJadwal([baris(1, 2), baris(2, 2, 11)]);
  const k = cekBentrok(rows, []);
  assert.equal(k.length, 1);
  assert.equal(k[0].baris, 2);
});

test("jam berurutan tidak dianggap bentrok", () => {
  const { rows } = rapikanJadwal([baris(1, 2), baris(3, 2, 11), baris(5, 1, 12)]);
  assert.deepEqual(cekBentrok(rows, []), []);
});

test("bentrok dengan jadwal kelas yang sudah tersimpan", () => {
  const { rows } = rapikanJadwal([baris(3, 2)]);
  const ada = [{ ...dasar, hari: "senin", kelas_id: 1, teacher_id: 99, jam_ke: 4, jumlah_jam: 1, nama_mapel: "Matematika" }];
  const k = cekBentrok(rows, ada);
  assert.equal(k.length, 1);
  assert.match(k[0].pesan, /Matematika/);
});

test("guru sudah mengajar di kelas lain pada jam yang sama", () => {
  const { rows } = rapikanJadwal([baris(1, 2, 10)]);
  const ada = [{ ...dasar, hari: "senin", kelas_id: 2, teacher_id: 10, jam_ke: 2, jumlah_jam: 2, nama_kelas: "XI TKJ" }];
  const k = cekBentrok(rows, ada);
  assert.equal(k.length, 1);
  assert.match(k[0].pesan, /XI TKJ/);
});

test("hari / semester / tahun ajaran lain tidak bentrok", () => {
  const { rows } = rapikanJadwal([baris(1, 2)]);
  const ada = [
    { ...dasar, hari: "selasa", jam_ke: 1, jumlah_jam: 2, teacher_id: 10 },
    { ...dasar, hari: "senin", semester: 2, jam_ke: 1, jumlah_jam: 2, teacher_id: 10 },
    { ...dasar, hari: "senin", ta_id: 6, jam_ke: 1, jumlah_jam: 2, teacher_id: 10 },
  ];
  assert.deepEqual(cekBentrok(rows, ada), []);
});
