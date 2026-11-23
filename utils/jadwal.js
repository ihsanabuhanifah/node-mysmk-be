// Validasi & cek bentrok jadwal pelajaran (fungsi murni, mudah diuji).
// Rentang sebuah jadwal = jam ke-[jam_ke .. jam_ke + jumlah_jam - 1].

const HARI = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"];
const FIELD = ["hari", "kelas_id", "teacher_id", "mapel_id", "jam_ke", "jumlah_jam", "semester", "ta_id"];

const akhir = (j) => Number(j.jam_ke) + Number(j.jumlah_jam) - 1;
const tumpang = (a, b) => Number(a.jam_ke) <= akhir(b) && Number(b.jam_ke) <= akhir(a);
const rentang = (j) => (Number(j.jumlah_jam) > 1 ? `jam ke-${j.jam_ke}–${akhir(j)}` : `jam ke-${j.jam_ke}`);

/** Rapikan & validasi isian. @returns { rows, errors: [{baris, pesan}] } (baris mulai 1) */
function rapikanJadwal(data) {
  const errors = [];
  const rows = (Array.isArray(data) ? data : []).map((r, i) => {
    const row = {
      hari: String(r?.hari || "").toLowerCase().trim(),
      kelas_id: Number(r?.kelas_id),
      teacher_id: Number(r?.teacher_id),
      mapel_id: Number(r?.mapel_id),
      jam_ke: Number(r?.jam_ke),
      jumlah_jam: Number(r?.jumlah_jam),
      semester: Number(r?.semester),
      ta_id: Number(r?.ta_id),
      student: r?.student || "",
      status: 1,
    };
    const kurang = FIELD.filter((f) => (f === "hari" ? !HARI.includes(row.hari) : !(row[f] > 0)));
    if (kurang.length) errors.push({ baris: i + 1, pesan: `Belum lengkap: ${kurang.join(", ")}` });
    else if (row.jumlah_jam > 8 || row.jam_ke > 12) errors.push({ baris: i + 1, pesan: "Jam ke / jumlah jam tidak wajar" });
    return row;
  });
  if (rows.length === 0) errors.push({ baris: 0, pesan: "Tidak ada jadwal yang dikirim" });
  return { rows, errors };
}

/**
 * Cek bentrok.
 * @param rows jadwal baru (sudah dirapikan)
 * @param ada  jadwal aktif yang sudah tersimpan pada hari & tahun ajaran yang sama
 *             [{id, hari, kelas_id, teacher_id, jam_ke, jumlah_jam, semester, ta_id, nama_kelas?, nama_guru?, nama_mapel?}]
 * @returns [{baris, pesan}]
 */
function cekBentrok(rows, ada = []) {
  const konflik = [];
  rows.forEach((r, i) => {
    const sama = (x) => x.hari === r.hari && Number(x.ta_id) === r.ta_id && Number(x.semester) === r.semester;

    // 1. sesama baris baru di kelas yang sama
    rows.forEach((o, k) => {
      if (k < i && sama(o) && o.kelas_id === r.kelas_id && tumpang(o, r)) {
        konflik.push({ baris: i + 1, pesan: `${rentang(r)} bertabrakan dengan baris ${k + 1} (${rentang(o)})` });
      }
    });

    // 2. jadwal kelas yang sudah ada
    ada
      .filter((x) => sama(x) && Number(x.kelas_id) === r.kelas_id && tumpang(x, r))
      .forEach((x) =>
        konflik.push({
          baris: i + 1,
          pesan: `Kelas sudah punya jadwal ${rentang(x)}${x.nama_mapel ? ` (${x.nama_mapel})` : ""}`,
        })
      );

    // 3. guru sudah mengajar di kelas lain pada jam yang sama
    ada
      .filter((x) => sama(x) && Number(x.teacher_id) === r.teacher_id && Number(x.kelas_id) !== r.kelas_id && tumpang(x, r))
      .forEach((x) =>
        konflik.push({
          baris: i + 1,
          pesan: `Guru sudah mengajar ${x.nama_kelas || "kelas lain"} pada ${rentang(x)}`,
        })
      );
  });
  return konflik;
}

module.exports = { HARI, rapikanJadwal, cekBentrok, tumpang };
