# Orange Pi Kubernetes

My home lab: a single-node [k3s](https://k3s.io/) cluster on an Orange Pi Zero 2W (ARM64, Linux).
All services are packaged as Helm charts and deployed together with [Helmfile](helmfile.yaml).

## Services

| Chart | What it runs |
|---|---|
| `web-router` | Traefik IngressRoutes with middlewares: rate limiting, compression, basic auth |
| `hinst-website` | My personal website ([source](https://github.com/hinst/hinst-website), Go + React), a daily update CronJob, a manual migration Job |
| `hinst-website-storage` | Persistent volumes, weekly `pg_dump` backups with rotation, Git history of the website data, Gitweb UI |
| `postgre-sql` | PostgreSQL 18, tuned for low memory (see below) |
| `web-counter` | Small visitor counter service |
| `prettier-server` | Code formatting service (Bun.js) |
| `uptime-kuma` | Uptime monitoring |
| `adminer` | Database web UI behind basic auth |
| `dashboard-account` | Service account for the Kubernetes Dashboard |

Custom images are built for ARM64 and pushed to a local Docker registry (`localhost:5000`).
Secrets (passwords, tokens) are read by Helm from local files, which are excluded from Git.

## Deploy

```bat
deploy.bat
```

Runs `helmfile apply`, then restarts the deployments that use `latest` images.

## PostgreSQL memory

https://stackoverflow.com/questions/28844170/how-to-limit-the-memory-that-is-available-for-postgresql-server
* Total memory = shared_buffers + (temp_buffers + work_mem) × max_connections

Values:
* shared_buffers = 128 MB
* temp_buffers = 8 MB
* work_mem = 4 MB
* max_connections = 10
    * Default is 100, I set 10
* Calculation: 128 + (8 + 4) * 10 = 248

To sum it up, PostgreSQL should use up to around 250 MB of memory
