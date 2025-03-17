helmfile apply &&^
kubectl rollout restart deployment web-router &&^
kubectl rollout restart deployment --namespace=smart-progress-or web-ui &&^
kubectl rollout restart deployment --namespace=smart-progress-or hinst-website
echo %ERRORLEVEL%