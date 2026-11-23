// Helper test: ganti modul `models` (Sequelize + database) dengan objek palsu di memori,
// sehingga test tidak butuh MySQL dan bisa jalan di CI.
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const MODELS_PATH = require.resolve(path.join(ROOT, "models"));

// variabel lingkungan minimal untuk test
process.env.JWT_SECRET_ACCESS_TOKEN = process.env.JWT_SECRET_ACCESS_TOKEN || "rahasia-test-access";
process.env.JWT_ACCESS_EXPIRESIN = "30m";
process.env.REFRESH_TOKEN_DAYS = "7";

/** Pasang objek palsu sebagai hasil require("../models"). */
function mockModels(fake) {
  require.cache[MODELS_PATH] = { id: MODELS_PATH, filename: MODELS_PATH, loaded: true, exports: fake };
  return fake;
}

/** Muat modul proyek dalam keadaan segar (setelah mockModels dipanggil). */
function loadFresh(relPath) {
  const full = require.resolve(path.join(ROOT, relPath));
  Object.keys(require.cache).forEach((k) => {
    if (k.startsWith(ROOT) && !k.includes("node_modules") && k !== MODELS_PATH && !k.includes(`${path.sep}tests${path.sep}`)) {
      delete require.cache[k];
    }
  });
  return require(full);
}

/** Objek res Express palsu untuk memanggil handler langsung. */
function fakeRes() {
  return {
    statusCode: 200,
    body: undefined,
    headersSent: false,
    status(c) {
      this.statusCode = c;
      return this;
    },
    json(b) {
      this.body = b;
      this.headersSent = true;
      return this;
    },
    send(b) {
      this.body = b;
      this.headersSent = true;
      return this;
    },
    sendStatus(c) {
      this.statusCode = c;
      this.headersSent = true;
      return this;
    },
  };
}

/** Transaksi palsu (commit/rollback tidak melakukan apa-apa). */
const fakeTransaction = async () => ({ commit: async () => {}, rollback: async () => {} });

module.exports = { mockModels, loadFresh, fakeRes, fakeTransaction };
