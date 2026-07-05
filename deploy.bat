helmfile apply &&^
kubectl rollout restart deployment --namespace=hinst-website hinst-website &&^
kubectl rollout restart deployment --namespace=default adminer &&^
kubectl rollout restart deployment --namespace=default uptime-kuma
echo ErrorLevel: %ERRORLEVEL%