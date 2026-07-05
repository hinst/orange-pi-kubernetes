helmfile apply &&^
kubectl rollout restart deployment --namespace=hinst-website hinst-website &&^
kubectl rollout restart deployment --namespace=hinst-website adminer &&^
kubectl rollout restart deployment --namespace=default uptime-kuma
echo %ERRORLEVEL%