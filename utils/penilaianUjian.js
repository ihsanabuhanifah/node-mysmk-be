// Logika penilaian ujian TERPUSAT.
// Dipakai oleh: submit siswa (Santri/ExamController), penilaian ulang guru
// (Guru/NilaiController.updateLastExam) dan analisis soal (Guru/UjianController).
// Dengan satu sumber logika, hasil submit & penilaian ulang selalu konsisten.

// Tipe yang dinilai manual oleh guru (poin diisi guru)
const TIPE_MANUAL = ["ES", "LV"];
// KKM default (sebelumnya hard-code di FE: nilai > 74 = lulus)
const KKM = 75;

const keArray = (v) =>
  Array.isArray(v)
    ? v.map((x) => String(x).trim().toLowerCase())
    : String(v ?? "")
        .split(",")
        .map((x) => x.trim().toLowerCase())
        .filter((x) => x !== "");

// MP (pilihan ganda kompleks): urutan tidak berpengaruh
function samaMP(jawabanSiswa, kunci) {
  const a = [...keArray(jawabanSiswa)].sort();
  const b = [...keArray(kunci)].sort();
  return a.length > 0 && JSON.stringify(a) === JSON.stringify(b);
}

// MTF (benar/salah majemuk): harus sesuai urutan
function samaMTF(jawabanSiswa, kunci) {
  const k = keArray(kunci).map((x) => x === "true");
  const s = Array.isArray(jawabanSiswa)
    ? jawabanSiswa.map((x) => x === true || String(x).toLowerCase() === "true")
    : keArray(jawabanSiswa).map((x) => x === "true");
  if (k.length === 0 || k.length !== s.length) return false;
  return k.every((v, i) => v === s[i]);
}

// PG / TF / lainnya: dibandingkan apa adanya (tanpa beda huruf besar/kecil & spasi)
function samaBiasa(jawabanSiswa, kunci) {
  if (jawabanSiswa === null || jawabanSiswa === undefined || jawabanSiswa === "") return false;
  return String(jawabanSiswa).trim().toLowerCase() === String(kunci ?? "").trim().toLowerCase();
}

function isBenar(tipe, jawabanSiswa, kunci) {
  if (tipe === "MP") return samaMP(jawabanSiswa, kunci);
  if (tipe === "MTF") return samaMTF(jawabanSiswa, kunci);
  return samaBiasa(jawabanSiswa, kunci);
}

/**
 * Rapikan jawaban kiriman client:
 * - hanya satu jawaban per soal (entri TERAKHIR yang dipakai)
 * - id soal di luar ujian diabaikan
 */
function normalisasiJawaban(jawaban, soalIds) {
  const izin = new Set((soalIds || []).map(Number));
  const peta = new Map();
  (Array.isArray(jawaban) ? jawaban : []).forEach((j) => {
    const id = Number(j?.id);
    if (!Number.isFinite(id) || !izin.has(id)) return;
    peta.set(id, { ...j, id });
  });
  return peta;
}

const poinTerisi = (p) => p !== undefined && p !== null && p !== "" && !Number.isNaN(Number(p));

/**
 * Hitung nilai.
 * @param soal   [{id, tipe, jawaban(kunci), point}]
 * @param jawaban array jawaban siswa (boleh berisi field point untuk ES/LV dari guru)
 * @param opsi.pakaiPoinManual true = pakai poin ES/LV dari jawaban (penilaian guru)
 * @returns { nilai(0..100, 2 desimal), total_point, point_siswa, keterangan, jawaban(array rapi) }
 */
function hitungNilai(soal, jawaban, { pakaiPoinManual = false } = {}) {
  const peta = normalisasiJawaban(jawaban, soal.map((s) => s.id));
  let total_point = 0;
  let point_siswa = 0;
  let adaManualBelumDinilai = false;
  const hasilJawaban = [];

  soal.forEach((item) => {
    const poinSoal = Number(item.point) || 0;
    total_point += poinSoal;
    const jawab = peta.get(Number(item.id));

    if (TIPE_MANUAL.includes(item.tipe)) {
      if (pakaiPoinManual && jawab && poinTerisi(jawab.point)) {
        const p = Math.min(Math.max(Number(jawab.point), 0), poinSoal);
        point_siswa += p;
        hasilJawaban.push({ ...jawab, point: p });
      } else {
        adaManualBelumDinilai = true;
        if (jawab) hasilJawaban.push(jawab);
      }
      return;
    }

    if (jawab) {
      const benar = isBenar(item.tipe, jawab.jawaban, item.jawaban);
      if (benar) point_siswa += poinSoal;
      hasilJawaban.push(jawab);
    }
  });

  let nilai = total_point > 0 ? (point_siswa / total_point) * 100 : 0;
  nilai = Math.min(Math.max(Number(nilai.toFixed(2)), 0), 100);

  return {
    nilai,
    total_point,
    point_siswa,
    keterangan: adaManualBelumDinilai ? "Terdapat essay belum diberikan point" : "",
    jawaban: hasilJawaban,
  };
}

const parseJSON = (v, fallback) => {
  try {
    const r = typeof v === "string" ? JSON.parse(v) : v;
    return r ?? fallback;
  } catch (e) {
    return fallback;
  }
};

module.exports = {
  TIPE_MANUAL,
  KKM,
  isBenar,
  normalisasiJawaban,
  hitungNilai,
  parseJSON,
};
