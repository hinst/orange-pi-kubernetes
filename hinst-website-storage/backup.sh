#!/bin/bash
set -e
backupDir="/data/hinst-website-backups"
backupsToKeep=4

# Save new backup
cd "$backupDir"
echo "Dumping SQL"
pg_dump --dbname=hinst-website \
	--host postgre-sql.postgre-sql.svc --port 5431 --username hinst_website_downloader \
	--file=dump.sql --clean --if-exists --verbose

dateTimeString="$(date +%Y-%m-%d_%H-%M-%S)"
backupFile="$backupDir/backup_$dateTimeString.tar.gz"
echo "Compressing $backupFile"
tar --create --auto-compress --file="$backupFile" dump.sql
rm dump.sql

# Delete old backups
mapfile -t filesToRemove < <(find "$backupDir" -maxdepth 1 -type f | sort | head -n -$backupsToKeep)
for fileToRemove in "${filesToRemove[@]}"
do
	echo "Removing old backup: $fileToRemove"
	rm "$fileToRemove"
done

echo "$(date) Completed"
ls -l -h "$backupDir"
