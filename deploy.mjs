//@ts-check
// Build & push Docker images, apply Helm, and deploy the dynamic frontend

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

/** @param {string} directory */
function requireDirectory(directory) {
	if (!existsSync(directory))
		throw new Error(`Directory not found: ${directory}`);
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
	@param {string} [cwd]
*/
function exec(command, cwd = repoRoot) {
	console.log(command);
	execSync(command, { stdio: 'inherit', cwd });
};

+function prepareDockerImages() {
	exec(`node "${path.join(hinstWebsiteRoot, 'scripts', 'build-docker.mjs')}"`);
	exec(`node "${path.join(hinstWebsiteRoot, 'scripts', 'push-docker.mjs')}"`);

	exec(`docker build -t ${registry}/hinst/adminer --progress=plain --platform=linux/arm64 .`, path.join(repoRoot, 'adminer'));
	exec(`docker push ${registry}/hinst/adminer`);

	exec(`docker build -t ${registry}/hinst/prettier-server --progress=plain --platform=linux/arm64 .`, prettierServerRoot);
	exec(`docker push ${registry}/hinst/prettier-server`, prettierServerRoot);
}();

+function deployKubernetes() {
	exec('helmfile apply');
	exec('kubectl rollout restart deployment --namespace=hinst-website hinst-website');
	exec('kubectl rollout status deployment/hinst-website --namespace=hinst-website --timeout=120s');
	exec('kubectl rollout restart deployment --namespace=default adminer');
	exec('kubectl rollout restart deployment --namespace=default uptime-kuma');
}();

+function deployDynamicFrontend() {
	exec('git pull --ff-only', githubIoRoot);
	exec(`node "${path.join(frontendRoot, 'scripts', 'deploy-github-io.mjs')}"`, frontendRoot);

	// Commit and push if anything changed
	const status = execSync('git status --porcelain -- dynamic', { cwd: githubIoRoot, encoding: 'utf8' });
	if (status.trim().length > 0) {
		exec('git add dynamic', githubIoRoot);
		exec('git commit -m "Update dynamic frontend build"', githubIoRoot);
		exec('git push', githubIoRoot);
	} else
		console.log('hinst.github.io unchanged, skipping commit/push');
}();
