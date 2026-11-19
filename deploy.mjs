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
