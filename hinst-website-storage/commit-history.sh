#!/bin/sh
set -e
cd /history

if [ ! -d .git ]; then
  echo "Initializing new repository..."
  git init
  git config user.name "backup-bot"
  git config user.email "hinstance@yandex.ru"
fi

TIMESTAMP="$(date +%Y-%m-%d\ %H-%M-%S)"
echo "Committing: Automated backup at $TIMESTAMP"

git add -A
# git commit may fail if nothing changed (e.g. on first run with identical dump)
git commit \
  --message="Automated backup at $TIMESTAMP" \
  || echo "No changes to commit — skipping."

echo "Running git gc"
git gc

echo "$(date) Completed successfully"
ls -la /history/

echo "Latest commits"
git log --oneline -5
