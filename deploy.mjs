// Apply the Helmfile, restart the deployments, and deploy the frontend

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

// Sibling repositories:
const hinstWebsiteRoot = path.resolve(repoRoot, '..', 'hinst-website');
const frontendRoot = path.join(hinstWebsiteRoot, 'frontend');
const githubIoRoot = path.resolve(repoRoot, '..', 'hinst.github.io');

const exec = (command, cwd = repoRoot) => {
	console.log(command);
	execSync(command, { stdio: 'inherit', cwd });
};

// Backend: build, push, apply, and restart
for (const command of [
	`node "${path.join(hinstWebsiteRoot, 'scripts', 'build-docker.mjs')}"`,
	`node "${path.join(hinstWebsiteRoot, 'scripts', 'push-docker.mjs')}"`,
	'helmfile apply',
	'kubectl rollout restart deployment --namespace=hinst-website hinst-website',
	'kubectl rollout restart deployment --namespace=default adminer',
	'kubectl rollout restart deployment --namespace=default uptime-kuma',
])
	exec(command);

// Frontend: build into hinst.github.io/dynamic
// (the script uses relative paths, so it must run from the frontend folder)
exec(`node "${path.join(frontendRoot, 'scripts', 'deploy-github-io.mjs')}"`, frontendRoot);

// Commit and push if anything changed
const status = execSync('git status --porcelain', { cwd: githubIoRoot, encoding: 'utf8' });
if (status.trim().length > 0)
	for (const command of [
		'git add -A',
		'git commit -m "Update frontend build"',
		'git push',
	])
		exec(command, githubIoRoot);
else
	console.log('hinst.github.io unchanged, skipping commit/push');
