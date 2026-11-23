#!/bin/sh
# Backup database MySMK (dijalankan harian oleh container "backup", lihat docker-compose.yml).
#  1. mysqldump -> /backups/mysmk-<db>-YYYYMMDD-HHMM.sql.gz (disimpan di VPS)
#  2. cek file (gzip valid & tidak kosong)
#  3. hapus backup lokal yang lebih lama dari BACKUP_KEEP_DAYS (default 14 hari)
#  4. opsional: salin ke penyimpanan terpisah via rclone (BACKUP_RCLONE_REMOTE)
#
# Kredensial DB dibaca dari /app/.env (file .env backend yang sama).
# Jalankan manual: docker compose run --rm backup /backup.sh
set -eu

ENV_FILE="${ENV_FILE:-/app/.env}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
gagal() { log "GAGAL: $*"; exit 1; }

[ -f "$ENV_FILE" ] || gagal "file $ENV_FILE tidak ditemukan"

# Ambil nilai dari .env (format "KEY = value" atau KEY=value, boleh pakai tanda kutip)
env_val() {
  sed -n "s/^[[:space:]]*$1[[:space:]]*=[[:space:]]*//p" "$ENV_FILE" | tail -n 1 \
    | sed -e 's/[[:space:]]*$//' -e 's/^"\(.*\)"$/\1/' -e "s/^'\(.*\)'$/\1/"
}

APP_ENV="$(env_val APP_ENV)"
DB_HOST="$(env_val DB_HOST)"
DB_PORT="$(env_val DB_PORT)"
DB_USER="$(env_val DB_USERNAME)"
DB_PASS="$(env_val DB_PASSWORD)"
case "${APP_ENV:-production}" in
  production) DB_NAME="$(env_val DB_DATABASE_PRODUCTION)" ;;
  test) DB_NAME="$(env_val DB_DATABASE_TEST)" ;;
  *) DB_NAME="$(env_val DB_DATABASE_DEVELOPMENT)" ;;
esac

# Nilai dari .env boleh ditimpa variabel lingkungan BACKUP_DB_* (mis. user khusus backup read-only)
DB_HOST="${BACKUP_DB_HOST:-$DB_HOST}"
DB_PORT="${BACKUP_DB_PORT:-${DB_PORT:-3306}}"
DB_USER="${BACKUP_DB_USER:-$DB_USER}"
DB_PASS="${BACKUP_DB_PASSWORD:-$DB_PASS}"
DB_NAME="${BACKUP_DB_NAME:-$DB_NAME}"

[ -n "$DB_HOST" ] && [ -n "$DB_USER" ] && [ -n "$DB_NAME" ] || gagal "DB_HOST / DB_USERNAME / nama database tidak lengkap di .env"

mkdir -p "$BACKUP_DIR"
STAMP="$(date '+%Y%m%d-%H%M')"
FILE="$BACKUP_DIR/mysmk-$DB_NAME-$STAMP.sql.gz"
TMP="$FILE.tmp"

if [ "${BACKUP_DRY_RUN:-0}" = "1" ]; then
  log "DRY RUN: akan membackup '$DB_NAME' dari $DB_HOST:$DB_PORT sebagai '$DB_USER' ke $FILE"
  exit 0
fi

log "Mulai backup '$DB_NAME' dari $DB_HOST:$DB_PORT"
# MYSQL_PWD agar password tidak terlihat di daftar proses.
# Kode keluar mysqldump dicatat ke file karena sh (POSIX) tidak punya "pipefail".
RC_FILE="$TMP.rc"
{
  if MYSQL_PWD="$DB_PASS" mysqldump \
    --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USER" \
    --single-transaction --quick --routines --triggers --events \
    --no-tablespaces --default-character-set=utf8mb4 \
    "$DB_NAME"; then
    echo 0 > "$RC_FILE"
  else
    echo $? > "$RC_FILE"
  fi
} | gzip -9 > "$TMP"
RC="$(cat "$RC_FILE" 2>/dev/null || echo 1)"
rm -f "$RC_FILE"
[ "$RC" = "0" ] || { rm -f "$TMP"; gagal "mysqldump keluar dengan kode $RC (cek host/user/password/izin database)"; }

gzip -t "$TMP" || { rm -f "$TMP"; gagal "file backup rusak"; }
# mysqldump menulis "-- Dump completed" di baris terakhir hanya bila dump selesai sempurna
gzip -dc "$TMP" | tail -n 1 | grep -q "Dump completed" || { rm -f "$TMP"; gagal "dump tidak lengkap (penanda akhir tidak ada)"; }
mv "$TMP" "$FILE"
log "Backup selesai: $FILE ($(du -h "$FILE" | cut -f1))"

# Rotasi backup lokal
KEEP="${BACKUP_KEEP_DAYS:-14}"
find "$BACKUP_DIR" -name 'mysmk-*.sql.gz' -type f -mtime +"$KEEP" -print -delete | sed 's/^/  dihapus (lokal): /' || true

# Salin ke penyimpanan terpisah (opsional)
if [ -n "${BACKUP_RCLONE_REMOTE:-}" ]; then
  log "Menyalin ke $BACKUP_RCLONE_REMOTE"
  rclone --config /config/rclone/rclone.conf copy "$FILE" "$BACKUP_RCLONE_REMOTE" || gagal "upload rclone gagal (backup lokal tetap tersimpan)"
  REMOTE_KEEP="${BACKUP_REMOTE_KEEP_DAYS:-60}"
  rclone --config /config/rclone/rclone.conf delete "$BACKUP_RCLONE_REMOTE" --min-age "${REMOTE_KEEP}d" --include 'mysmk-*.sql.gz' || true
  log "Salinan terpisah OK (disimpan $REMOTE_KEEP hari)"
else
  log "BACKUP_RCLONE_REMOTE belum diatur: backup hanya tersimpan di VPS"
fi
