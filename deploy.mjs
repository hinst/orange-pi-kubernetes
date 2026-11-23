//@ts-check
// Build & push Docker images, apply Helm, and deploy the dynamic frontend

import { spawnSync } from 'node:child_process';
import { statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

/** @param {string} directory */
function requireDirectory(directory) {
	let stats;
	try {
		stats = statSync(directory);
	} catch {
		throw new Error(`Directory not found: ${directory}`);
	}
	if (!stats.isDirectory())
		throw new Error(`Not a directory: ${directory}`);
	return directory;
}

const hinstWebsiteRoot = requireDirectory(path.resolve(repoRoot, '..', 'hinst-website'));
const frontendRoot = requireDirectory(path.join(hinstWebsiteRoot, 'frontend'));
const githubIoRoot = requireDirectory(path.resolve(repoRoot, '..', 'hinst.github.io'));
const prettierServerRoot = requireDirectory(path.resolve(repoRoot, '..', 'prettier-server'));

// Local Docker registry on the Orange Pi
const registry = '192.168.178.29:5000';

/**
	@param {string} command
	@param {string[]} [args]
	@param {string} [cwd]
*/
function exec(command, args = [], cwd = repoRoot) {
	console.log([command, ...args].join(' '));
	const result = spawnSync(command, args, { stdio: 'inherit', cwd });
	if (result.error) throw result.error;
	if (result.status !== 0)
		throw new Error(`Command failed with exit code ${result.status}: ${command}`);
}

+function prepareDockerImages() {
	exec('node', [path.join(hinstWebsiteRoot, 'scripts', 'build-docker.mjs')]);
	exec('node', [path.join(hinstWebsiteRoot, 'scripts', 'push-docker.mjs')]);

	exec('docker', ['build', '-t', `${registry}/hinst/adminer`, '--progress=plain', '--platform=linux/arm64', '.'], path.join(repoRoot, 'adminer'));
	exec('docker', ['push', `${registry}/hinst/adminer`]);

	exec('docker', ['build', '-t', `${registry}/hinst/prettier-server`, '--progress=plain', '--platform=linux/arm64', '.'], prettierServerRoot);
	exec('docker', ['push', `${registry}/hinst/prettier-server`], prettierServerRoot);
}();

+function deployKubernetes() {
	exec('helmfile', ['apply']);
	exec('kubectl', ['rollout', 'restart', 'deployment', '--namespace=hinst-website', 'hinst-website']);
	exec('kubectl', ['rollout', 'status', 'deployment/hinst-website', '--namespace=hinst-website', '--timeout=120s']);
	exec('kubectl', ['rollout', 'restart', 'deployment', '--namespace=default', 'adminer']);
	exec('kubectl', ['rollout', 'restart', 'deployment', '--namespace=default', 'uptime-kuma']);
}();

+function deployDynamicFrontend() {
	exec('git', ['pull', '--ff-only'], githubIoRoot);
	exec('node', [path.join(frontendRoot, 'scripts', 'deploy-github-io.mjs')], frontendRoot);

	// Commit and push if anything changed
	const status = spawnSync('git', ['status', '--porcelain', '--', 'dynamic'], { cwd: githubIoRoot, encoding: 'utf8' });
	if (status.error) throw status.error;
	if (status.status !== 0)
		throw new Error(`git status failed with exit code ${status.status}`);
	if (status.stdout.trim().length > 0) {
		exec('git', ['add', 'dynamic'], githubIoRoot);
		exec('git', ['commit', '-m', 'Update dynamic frontend build'], githubIoRoot);
		exec('git', ['push'], githubIoRoot);
	} else
		console.log('hinst.github.io unchanged, skipping commit/push');
}();
