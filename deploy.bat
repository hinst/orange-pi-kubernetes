helmfile apply &&^
kubectl rollout restart deployment web-router &&^
kubectl rollout restart deployment --namespace=smart-progress-or hinst-website &&^
kubectl rollout restart deployment --namespace=smart-progress-or adminer
echo %ERRORLEVEL%