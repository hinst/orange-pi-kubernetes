// Build the adminer Docker image (linux/arm64)

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

const commands = [
	'docker build -t 192.168.0.23:30001/hinst/adminer --progress=plain --platform=linux/arm64 .',
];

for (const command of commands) {
	console.log(command);
	execSync(command, { stdio: 'inherit', cwd: repoRoot });
}
