// Apply the Helmfile and restart the deployments

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

const commands = [
	'helmfile apply',
	'kubectl rollout restart deployment --namespace=hinst-website hinst-website',
	'kubectl rollout restart deployment --namespace=default adminer',
	'kubectl rollout restart deployment --namespace=default uptime-kuma',
];

for (const command of commands) {
	console.log(command);
	execSync(command, { stdio: 'inherit', cwd: repoRoot });
}
