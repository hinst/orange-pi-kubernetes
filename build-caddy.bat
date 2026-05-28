docker build --platform=linux/arm64 -t 192.168.0.23:30001/hinst/orange-caddy --progress=plain -f caddy.Dockerfile . && ^
docker push 192.168.0.23:30001/hinst/orange-caddy