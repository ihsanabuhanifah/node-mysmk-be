// Submit ujian santri: penilaian per tipe soal, submit ganda, submit terlambat.
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { mockModels, loadFresh, fakeRes } = require("./helpers/mock");
const { hitungNilai } = require("../utils/penilaianUjian");

const SOAL = [
  { id: 1, tipe: "PG", jawaban: "B", point: 10 },
  { id: 2, tipe: "MP", jawaban: "a,c", point: 10 },
  { id: 3, tipe: "MTF", jawaban: "true,false,true", point: 10 },
  { id: 4, tipe: "ES", jawaban: "", point: 10 },
];

// ---------- logika penilaian ----------
test("penilaian: PG/MP/MTF benar, essay menunggu dinilai guru", () => {
  const hasil = hitungNilai(SOAL, [
    { id: 1, jawaban: "b" }, // beda huruf besar/kecil tetap benar
    { id: 2, jawaban: "c,a" }, // MP urutan bebas
    { id: 3, jawaban: [true, false, true] },
    { id: 4, jawaban: "uraian siswa" },
  ]);
  assert.equal(hasil.total_point, 40);
  assert.equal(hasil.point_siswa, 30);
  assert.equal(hasil.nilai, 75);
  assert.match(hasil.keterangan, /essay belum/);
});

test("penilaian: jawaban ganda untuk soal sama -> yang terakhir dipakai, soal di luar ujian diabaikan", () => {
  const hasil = hitungNilai(SOAL.slice(0, 1), [
    { id: 1, jawaban: "A" },
    { id: 1, jawaban: "B" },
    { id: 99, jawaban: "B" },
  ]);
  assert.equal(hasil.nilai, 100);
  assert.equal(hasil.jawaban.length, 1);
});

test("penilaian: tidak menjawab -> 0, tidak error", () => {
  const hasil = hitungNilai(SOAL, null);
  assert.equal(hasil.nilai, 0);
});

// ---------- handler submit ----------
let nilaiRow;
let updateDipanggil;
let ctrl;

beforeEach(() => {
  updateDipanggil = [];
  nilaiRow = {
    id: 5,
    student_id: 20,
    status: "progress",
    jam_selesai: new Date(Date.now() + 30 * 60 * 1000),
    jawaban: JSON.stringify([{ id: 1, jawaban: "A" }]), // jawaban tersimpan terakhir (autosave)
    exam: "[]",
    ujian: { id: 3, soal: JSON.stringify([1, 2]) },
  };
  mockModels({
    nilai: {
      findOne: async ({ where }) => (where.id === nilaiRow.id && where.student_id === nilaiRow.student_id ? nilaiRow : null),
      update: async (values, { where }) => {
        updateDipanggil.push(values);
        if (where.status === "progress" && nilaiRow.status === "progress") {
          Object.assign(nilaiRow, values);
          return [1];
        }
        return [0];
      },
    },
    bank_soal: { findAll: async () => SOAL.slice(0, 2) },
    ujian: {},
    student: {},
    mapel: {},
    kelas_student: {},
    teacher: {},
  });
  ctrl = loadFresh("controllers/Santri/ExamController.js");
});

const submit = async (body, student_id = 20) => {
  const res = fakeRes();
  await ctrl.submitExam({ body, student_id }, res);
  return res;
};

test("submit normal: dinilai dari jawaban yang dikirim & status jadi finish", async () => {
  const res = await submit({ id: 5, data: [{ id: 1, jawaban: "B" }, { id: 2, jawaban: "a,c" }] });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.nilai, 100);
  assert.equal(nilaiRow.status, "finish");
});

test("submit ganda: kiriman kedua tidak mengubah nilai", async () => {
  await submit({ id: 5, data: [{ id: 1, jawaban: "B" }, { id: 2, jawaban: "a,c" }] });
  const kedua = await submit({ id: 5, data: [] });
  assert.equal(kedua.body.msg, "Ujian telah berakhir");
  assert.equal(updateDipanggil.length, 1, "hanya satu kali update");
});

test("submit terlambat: dinilai dari jawaban tersimpan terakhir, bukan kiriman baru", async () => {
  nilaiRow.jam_selesai = new Date(Date.now() - 60 * 60 * 1000); // sudah lewat 1 jam
  const res = await submit({ id: 5, data: [{ id: 1, jawaban: "B" }, { id: 2, jawaban: "a,c" }] });
  assert.equal(res.body.nilai, 0, "jawaban tersimpan (A) salah -> nilai 0");
  assert.match(res.body.keterangan, /terlambat/);
});

test("santri lain tidak bisa men-submit ujian milik orang lain", async () => {
  const res = await submit({ id: 5, data: [] }, 999);
  assert.equal(res.statusCode, 422);
  assert.equal(nilaiRow.status, "progress");
});

test("ujian yang belum dimulai tidak bisa disubmit", async () => {
  nilaiRow.status = "open";
  const res = await submit({ id: 5, data: [] });
  assert.equal(res.statusCode, 422);
});
