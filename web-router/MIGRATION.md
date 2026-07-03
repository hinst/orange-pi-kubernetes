# Migration Notes: Caddy → Traefik

## What changed

| Feature | Caddy (old) | Traefik (new) |
|---------|-------------|---------------|
| Router | Dedicated pod on hostNetwork:30001 | IngressRoutes on Traefik (port 80) |
| Access URL | `http://192.168.0.23:30001` | `http://192.168.0.23` (port 80 default) |
| Basic auth | bcrypt in Caddyfile password files | htpasswd in Kubernetes Secrets |
| Rate limiting | IP-aware (whitelist 192.168.0.0/16) | All traffic (IP whitelist not replicated) |
| Compression | zstd + gzip | Traefik default (gzip) |
| Static files | file_server (favicon.ico) | Not needed (all routes are reverse proxies) |

## Before applying

1. **Replace password placeholders** — Each `*-auth` Secret has `password-here` in the `users.txt` field. Replace with your plain text password or an htpasswd-compatible hash. Traefik supports `$apr1$`, `{SHA}`, `{PLAIN}`, and bcrypt (`$2a$`) formats.

   Example for adminer-auth Secret:
   ```yaml
   stringData:
     users.txt: |
       admin:your-plain-text-password
   ```
   Or with a pre-hashed value:
   ```yaml
   stringData:
     users.txt: |
       admin:$apr1$xxxxxxxx/your-hash/
   ```

2. **Update Traefik entrypoint (optional)** — If you want to keep port 30001, add a custom Traefik entrypoint. This requires modifying the k3s Traefik args (e.g., via `traefik.args` in `/etc/rancher/k3s/config.yaml`):
   ```
   --entrypoints.web-router.address=:30001/tcp
   ```
   Then change the IngressRoute entrypoints from `web` to `web-router`.

3. **web-ui service missing** — The route `/smartProgress-or*` targets `web-ui.smart-progress-or.svc:8080` which does not currently exist in the cluster. The IngressRoute is kept so the route is ready when the service is deployed. Traefik will return 503 until then.

4. **configKeeper service missing** — The `config-keeper` service in namespace `config-keeper` does not exist. Same as above — route is kept, 503 until deployed.

5. **Rate limiting** — The Caddy config whitelisted `192.168.0.0/16` from rate limiting. Traefik's built-in rate limiter applies to all traffic. If you need IP-aware rate limiting, consider adding a Traefik plugin or adjusting the rate-limit Middleware parameters.

## Resources created

- **Secrets** (3): `adminer-auth`, `configkeeper-auth` (smart-progress-or), `docker-registry-auth` (default)
- **Middlewares** (4): `adminer-auth`, `configkeeper-auth`, `docker-registry-auth`, `rate-limit`
- **IngressRoutes** (2): `web-router` (smart-progress-or), `docker-registry-router` (default)
- **Service/Endpoints**: `docker-registry-service` (default, unchanged)

## Removed resources

- Caddy Deployment (hostNetwork:30001)
- Caddy ConfigMap (Caddyfile + password files)
- Static files ConfigMap (favicon.ico)
- Password text files (adminerPassword.txt, configKeeperPassword.txt, dockerRegistryPassword.txt)
- Root Caddyfile
