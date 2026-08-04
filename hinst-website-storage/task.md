We are building new backup job.
The old backup job is defined in `./templates/backup-runner.yaml`.
The new backup job will use `C:\Dev\postgresql-split`, see `README.md` in there to learn what it does.

New backup job steps:
1. Read dump.sql similarly to the old backup job, but no compression.
2. Use `postgresql-split` to save files into folder `data`.
3. Commit files to the Git repository

So yeah the new backup job will store database as versioned SQL files.
Please store them into folder `/home/orangepi/App/hinst-website-history`.
We can use init containers to run steps one after another.
Ask follow-up questions if anything is unclear and use `worker` subagent for steps, explorations, reviews, and such. Good luck.
