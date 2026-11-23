// Middleware access token: token valid/salah/kedaluwarsa dan akun diblokir.
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const JWT = require("jsonwebtoken");
const { mockModels, loadFresh, fakeRes } = require("./helpers/mock");

let statusUser;
let mw;

beforeEach(() => {
  statusUser = "active";
  mockModels({ user: { findByPk: async () => ({ status: statusUser }) } });
  mw = loadFresh("middleware/jwtValidateMiddleware.js");
});

const panggil = (header) =>
  new Promise((resolve) => {
    const req = { headers: header ? { "x-authorization": header } : {} };
    const res = fakeRes();
    let lanjut = false;
    const selesai = () => resolve({ req, res, lanjut });
    res.json = function (b) {
      this.body = b;
      selesai();
      return this;
    };
    res.sendStatus = function (c) {
      this.statusCode = c;
      selesai();
      return this;
    };
    mw(req, res, () => {
      lanjut = true;
      selesai();
    });
  });

const tokenWali = (opts = {}) =>
  JWT.sign({ id: 7, role: "Wali Siswa", roleId: 8, StudentId: 102 }, process.env.JWT_SECRET_ACCESS_TOKEN, {
    expiresIn: "30m",
    ...opts,
  });

test("tanpa header -> 401", async () => {
  const { res, lanjut } = await panggil();
  assert.equal(lanjut, false);
  assert.equal(res.statusCode, 401);
});

test("token valid -> lanjut & data user terisi di req", async () => {
  const { req, lanjut } = await panggil(`Bearer ${tokenWali()}`);
  assert.equal(lanjut, true);
  assert.equal(req.id, 7);
  assert.equal(req.role, "Wali Siswa");
  assert.equal(req.StudentId, 102);
});

test("token ditandatangani secret lain -> 401", async () => {
  const palsu = JWT.sign({ id: 7 }, "secret-lain");
  const { res, lanjut } = await panggil(`Bearer ${palsu}`);
  assert.equal(lanjut, false);
  assert.equal(res.statusCode, 401);
});

test("token kedaluwarsa -> 401 (frontend lalu memakai refresh token)", async () => {
  const lewat = JWT.sign({ id: 7, exp: Math.floor(Date.now() / 1000) - 60 }, process.env.JWT_SECRET_ACCESS_TOKEN);
  const { res, lanjut } = await panggil(`Bearer ${lewat}`);
  assert.equal(lanjut, false);
  assert.equal(res.statusCode, 401);
});

test("akun diblokir -> 401 walau token masih valid", async () => {
  statusUser = "diblokir";
  const { res, lanjut } = await panggil(`Bearer ${tokenWali()}`);
  assert.equal(lanjut, false);
  assert.equal(res.statusCode, 401);
});
