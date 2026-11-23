// Login & refresh token: rotasi, deteksi pemakaian ulang, kedaluwarsa, akun diblokir.
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const { mockModels, loadFresh } = require("./helpers/mock");

const hash = (t) => crypto.createHash("sha256").update(String(t)).digest("hex");

let store; // isi tabel refresh_tokens palsu
let users;
let svc;

function cocok(row, where) {
  return Object.entries(where).every(([k, v]) => (v === null ? row[k] === null || row[k] === undefined : row[k] === v));
}

beforeEach(() => {
  store = [];
  users = { 1: { id: 1, email: "wali@test", status: "active" } };
  mockModels({
    refresh_token: {
      async create(data) {
        const row = { id: store.length + 1, revoked_at: null, revoked_reason: null, ...data };
        row.update = async (u) => Object.assign(row, u);
        store.push(row);
        return row;
      },
      async findOne({ where }) {
        return store.find((r) => cocok(r, where)) || null;
      },
      async update(values, { where }) {
        const kena = store.filter((r) => cocok(r, where));
        kena.forEach((r) => Object.assign(r, values));
        return [kena.length];
      },
    },
    user: { findByPk: async (id) => users[id] || null },
  });
  svc = loadFresh("utils/tokenService.js");
});

test("refresh token disimpan sebagai hash, bukan token asli", async () => {
  const token = await svc.issueRefresh(1, 8, "UA");
  assert.equal(store.length, 1);
  assert.notEqual(store[0].token_hash, token);
  assert.equal(store[0].token_hash, hash(token));
  assert.equal(store[0].login_as, 8);
});

test("rotasi: token lama dicabut dan token baru diterbitkan", async () => {
  const lama = await svc.issueRefresh(1, 8);
  const hasil = await svc.rotateRefresh(lama);
  assert.equal(hasil.ok, true);
  assert.equal(hasil.loginAs, 8);
  assert.notEqual(hasil.refreshToken, lama);
  assert.equal(store[0].revoked_reason, "rotated");
  assert.equal(store.length, 2);
});

test("token tidak dikenal ditolak 401", async () => {
  const hasil = await svc.rotateRefresh("token-palsu");
  assert.equal(hasil.ok, false);
  assert.equal(hasil.code, 401);
});

test("token yang sudah dirotasi dipakai lagi setelah masa toleransi -> semua sesi dicabut", async () => {
  const lama = await svc.issueRefresh(1, 8);
  const baru = (await svc.rotateRefresh(lama)).refreshToken;
  store[0].revoked_at = new Date(Date.now() - 60 * 1000); // dirotasi 1 menit lalu (> 30 detik)

  const hasil = await svc.rotateRefresh(lama);
  assert.equal(hasil.ok, false);
  const rowBaru = store.find((r) => r.token_hash === hash(baru));
  assert.equal(rowBaru.revoked_reason, "reuse", "token baru ikut dicabut karena dugaan pencurian");
});

test("dua tab refresh bersamaan (dalam masa toleransi) tetap berhasil", async () => {
  const lama = await svc.issueRefresh(1, 8);
  await svc.rotateRefresh(lama);
  const keduaKali = await svc.rotateRefresh(lama); // < 30 detik
  assert.equal(keduaKali.ok, true);
});

test("token kedaluwarsa ditolak", async () => {
  const token = await svc.issueRefresh(1, 8);
  store[0].expires_at = new Date(Date.now() - 1000);
  const hasil = await svc.rotateRefresh(token);
  assert.equal(hasil.ok, false);
  assert.equal(hasil.code, 401);
});

test("akun diblokir: refresh ditolak dan semua sesi dicabut", async () => {
  const token = await svc.issueRefresh(1, 8);
  users[1].status = "diblokir";
  const hasil = await svc.rotateRefresh(token);
  assert.equal(hasil.ok, false);
  assert.equal(store[0].revoked_reason, "blocked");
});

test("logout mencabut token", async () => {
  const token = await svc.issueRefresh(1, 8);
  const n = await svc.revokeToken(token, "logout");
  assert.equal(n, 1);
  assert.equal((await svc.rotateRefresh(token)).ok, false);
});
