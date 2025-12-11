import { spawnSync } from 'child_process';

// This runner executes the detailed test scripts sequentially so `npm test`
// runs all suites.
const tests = [
	'tests/words.test.js',
	'tests/compile.test.js',
	'tests/errors.test.js',
	'tests/string.test.js'
];
let failed = false;

for (const t of tests) {
	console.log(`\n--- Running ${t} ---\n`);
	const res = spawnSync('node', [t], { stdio: 'inherit' });
	if (res.status !== 0) {
		failed = true;
		console.error(`${t} failed with exit code ${res.status}`);
	}
}

process.exit(failed ? 1 : 0);

