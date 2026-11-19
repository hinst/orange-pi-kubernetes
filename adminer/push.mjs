// Push the adminer Docker image

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

const commands = [
	'docker push 192.168.0.23:30001/hinst/adminer',
];

for (const command of commands) {
	console.log(command);
	execSync(command, { stdio: 'inherit', cwd: repoRoot });
}
