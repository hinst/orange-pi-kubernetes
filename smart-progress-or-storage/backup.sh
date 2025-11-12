#!/bin/bash
set -ex
backupDir="/data/smart-progress-or-backups"
backupsToKeep=4

# Save new backup
dateTimeString="$(date +%Y-%m-%d_%H-%M-%S)"
cd "/data"
backupFile="$backupDir/backup_$dateTimeString.tar.gz"
echo "$(date) Compressing -> $backupFile"
tar --create --auto-compress --file="$backupFile" --exclude="static-old" "smart-progress-or"

# Delete old backups
mapfile -t filesToRemove < <(find "$backupDir" -maxdepth 1 -type f | sort | head -n -$backupsToKeep)
for fileToRemove in "${filesToRemove[@]}"
do
	echo "Removing old backup: $fileToRemove"
	rm "$fileToRemove"
done

echo "$(date) Completed"
ls -l -h "$backupDir"
