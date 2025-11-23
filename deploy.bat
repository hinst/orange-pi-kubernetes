helmfile apply &&^
kubectl rollout restart deployment web-router &&^
kubectl rollout restart deployment --namespace=smart-progress-or hinst-website &&^
kubectl rollout restart deployment --namespace=smart-progress-or adminer &&^
kubectl rollout restart deployment --namespace=uptime-kuma uptime-kuma
echo %ERRORLEVEL%