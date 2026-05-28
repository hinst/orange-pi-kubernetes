FROM --platform=linux/aarch64 caddy:builder AS builder
ENV GOCACHE=/root/.cache/go-build
RUN --mount=type=cache,target="/root/.cache/go-build" xcaddy build --with github.com/mholt/caddy-ratelimit

FROM --platform=linux/aarch64 caddy:latest
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
RUN adduser -D -u 1000 caddy
USER caddy