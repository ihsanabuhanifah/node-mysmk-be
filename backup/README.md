# Backup database MySMK

Container `backup` (lihat `docker-compose.yml`) menjalankan `mysqldump` setiap hari pukul 02:00 WIB.

- File: `./backups/mysmk-<database>-YYYYMMDD-HHMM.sql.gz` di VPS, disimpan 14 hari.
- Dump dicek otomatis (gzip valid + penanda `-- Dump completed`); dump gagal/terpotong tidak disimpan.
- Folder `backups/` berisi data asli: sudah di-.gitignore & .dockerignore, jangan dibagikan.

## Perintah

```bash
docker compose up -d --build backup          # aktifkan jadwal harian
docker compose run --rm backup /backup.sh    # backup sekarang (uji coba)
docker compose logs -f backup                # lihat hasil backup
ls -lh backups/
```

## Salinan di luar VPS (disarankan)

Backup yang hanya ada di VPS ikut hilang bila VPS rusak. Salin ke Google Drive / S3 dengan rclone:

```bash
docker compose run --rm backup rclone config --config /config/rclone/rclone.conf
# buat remote, mis. bernama "gdrive"
```

Lalu isi di `docker-compose.yml`: `BACKUP_RCLONE_REMOTE: "gdrive:backup-mysmk"` dan jalankan
`docker compose up -d backup`. Salinan di remote disimpan 60 hari (`BACKUP_REMOTE_KEEP_DAYS`).

## Restore (mengembalikan data)

> Restore MENIMPA isi database tujuan. Uji dulu ke database kosong/staging.

```bash
gunzip -c backups/mysmk-<database>-<tanggal>.sql.gz | \
  mysql -h <DB_HOST> -P <DB_PORT> -u <DB_USERNAME> -p <nama_database_tujuan>
```

Sebaiknya uji restore ke database terpisah minimal sebulan sekali untuk memastikan backup benar-benar bisa dipakai.
