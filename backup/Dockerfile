# Container backup database: mysqldump terjadwal (cron) + rclone untuk salinan di luar VPS.
FROM alpine:3.20

RUN apk add --no-cache mariadb-client rclone tzdata gzip ca-certificates

ENV TZ=Asia/Jakarta

COPY backup.sh /backup.sh
RUN chmod +x /backup.sh

# Jadwal default 02:00 WIB setiap hari (bisa diganti lewat BACKUP_CRON)
CMD ["sh", "-c", "echo \"${BACKUP_CRON:-0 2 * * *} /backup.sh >> /proc/1/fd/1 2>&1\" > /etc/crontabs/root && echo \"Jadwal backup: ${BACKUP_CRON:-0 2 * * *} (WIB)\" && crond -f -l 8"]
