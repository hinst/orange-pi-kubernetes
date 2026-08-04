# Task

Expose Git repository on web ui.

Example:

```
docker run -d \
  --name git-ui-klaus \
  -p 8080:8080 \
  -v /path/to/your/local/repos:/repos \
  -e KLAUS_REPOS="/repos" \
  jonashaag/klaus
```

But we do not run Docker, we run Kubernetes, so we have to adapt this example.

To see what repository needs to be exposed, see `hinst-website-storage\templates\history-job.yaml`
To add ingress, see `web-router\templates`. New web UI should be behind `web-router\traefikPassword.txt` as usual, look for examples.
