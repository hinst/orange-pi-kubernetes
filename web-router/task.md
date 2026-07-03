# Migration Caddy to Traefik

Keep it simple. I use k3s on Orange Pi, and it already includes Traefik running in namespace `kube-system`.
Plan the change, split it into tasks, and launch subagents as needed to complete the migration.
Passwords are currently hashed. If Caddy's password hashing format is not compatible with Traefik, then place `password-here` placeholders so I can insert my plain text passwords in there.
Command `kubectl` is available if you wanna see something in there.