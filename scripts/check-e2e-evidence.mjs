import {access, readFile, readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const suiteDirectories = {
  public: path.join(rootDirectory, 'test-results', 'public'),
  phase1: path.join(rootDirectory, 'test-results', 'phase1'),
  auth: path.join(rootDirectory, 'test-results', 'auth'),
};
const phase1Screenshots = new Set([
  'button-variants.png',
  'card-variants.png',
  'field-variants.png',
  'full-showcase-dark.png',
  'full-showcase-light.png',
  'native-dialog.png',
  'radar-semantics.png',
]);

async function readRunStatus(directory) {
  const statusFile = path.join(directory, '.last-run.json');
  await access(statusFile);
  const status = JSON.parse(await readFile(statusFile, 'utf8'));
  if (status.status !== 'passed' || status.failedTests?.length) {
    throw new Error(
      `Playwright evidence is not passing: ${path.relative(rootDirectory, statusFile)}`,
    );
  }
}

async function collectFiles(directory) {
  const entries = await readdir(directory, {withFileTypes: true});
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? collectFiles(entryPath) : [entryPath];
    }),
  );
  return files.flat();
}

const uniqueDirectories = new Set(
  Object.values(suiteDirectories).map((directory) => path.resolve(directory)),
);
if (uniqueDirectories.size !== Object.keys(suiteDirectories).length) {
  throw new Error('Each Playwright suite must use a dedicated output directory.');
}

await Promise.all(Object.values(suiteDirectories).map(readRunStatus));

const capturedScreenshots = new Set(
  (await collectFiles(suiteDirectories.phase1))
    .filter((file) => file.endsWith('.png'))
    .map((file) => path.basename(file)),
);
const missingScreenshots = [...phase1Screenshots].filter((file) => !capturedScreenshots.has(file));
if (missingScreenshots.length) {
  throw new Error(`Missing Phase 1 evidence: ${missingScreenshots.join(', ')}`);
}

console.log(`E2E evidence retained: public, phase1 (${phase1Screenshots.size} screenshots), auth.`);
