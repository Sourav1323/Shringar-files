#!/usr/bin/env bash
# ==============================================================================
# Automated MySQL Database Backup Script with 7-Day Rotation
# Recommended cron entry: 0 3 * * * /opt/shringar/scripts/backup-db.sh
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/opt/shringar/backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/shringar_db_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "⏳ Starting database backup: $BACKUP_FILE..."

# Stream dump from inside MySQL container into gzip archive
docker exec shringar-prod-mysql /usr/bin/mysqldump -u root -p"${DB_ROOT_PASSWORD}" shringar_db \
  --single-transaction \
  --quick \
  --lock-tables=false | gzip -9 > "$BACKUP_FILE"

echo "✅ Backup completed: $(ls -lh "$BACKUP_FILE" | awk '{print $9, "(" $5 ")"}')"

# Retain only last 7 days of backups, delete older ones
echo "🧹 Pruning backups older than 7 days..."
find "$BACKUP_DIR" -type f -name "shringar_db_*.sql.gz" -mtime +7 -delete

echo "🎉 Database backup process finished successfully!"
