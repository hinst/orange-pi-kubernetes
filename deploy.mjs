// Apply the Helmfile and restart the deployments
//
// NOTE: The hinst-website repository must be checked out in a sibling
// directory (i.e. ../hinst-website) so the build/push scripts can be
// accessed via the `..` path below.

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.dirname(fileURLToPath(import.meta.url));
const hinstWebsiteRoot = path.resolve(repoRoot, '..', 'hinst-website');
const frontendRoot = path.join(hinstWebsiteRoot, 'frontend');
const githubIoRoot = path.resolve(repoRoot, '..', 'hinst.github.io');

const commands = [
	`node "${path.join(hinstWebsiteRoot, 'scripts', 'build-docker.mjs')}"`,
	`node "${path.join(hinstWebsiteRoot, 'scripts', 'push-docker.mjs')}"`,
	'helmfile apply',
	'kubectl rollout restart deployment --namespace=hinst-website hinst-website',
	'kubectl rollout restart deployment --namespace=default adminer',
	'kubectl rollout restart deployment --namespace=default uptime-kuma',
];

for (const command of commands) {
	console.log(command);
	execSync(command, { stdio: 'inherit', cwd: repoRoot });
}

// Frontend: build into hinst.github.io/dynamic, then commit and push
// (the script uses relative paths, so it must run from the frontend folder)
const frontendBuild = `node "${path.join(frontendRoot, 'scripts', 'deploy-github-io.mjs')}"`;
console.log(frontendBuild);
execSync(frontendBuild, { stdio: 'inherit', cwd: frontendRoot });

const status = execSync('git status --porcelain', { cwd: githubIoRoot, encoding: 'utf8' });
if (status.trim().length > 0) {
	for (const command of [
		'git add -A',
		'git commit -m "Update frontend build"',
		'git push',
	]) {
		console.log(command);
		execSync(command, { stdio: 'inherit', cwd: githubIoRoot });
	}
} else {
	console.log('hinst.github.io unchanged, skipping commit/push');
}
