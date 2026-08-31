import {spawnSync} from 'node:child_process';
import {readFile, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const functionsDirectory = path.join(rootDirectory, 'functions');

const emulatorFiles = [
  {
    path: path.join(functionsDirectory, '.env.local'),
    contents:
      'GEMINI_MODEL=gemini-3.6-flash\nANALYSIS_PROVIDER=deterministic\nDAILY_ANALYSIS_LIMIT=10\n',
  },
  {
    path: path.join(functionsDirectory, '.secret.local'),
    contents: 'GEMINI_API_KEY=unused\n',
  },
];

async function readIfPresent(filePath) {
  try {
    return await readFile(filePath);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

function run(command) {
  const result = spawnSync(command, {
    cwd: rootDirectory,
    env: process.env,
    shell: true,
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`Command failed with exit code ${result.status}: ${command}`);
  }
}

const snapshots = new Map();

try {
  for (const emulatorFile of emulatorFiles) {
    snapshots.set(emulatorFile.path, await readIfPresent(emulatorFile.path));
    await writeFile(emulatorFile.path, emulatorFile.contents, {encoding: 'utf8', flag: 'w'});
  }

  run('npm run build:functions');
  run(
    'npx firebase-tools emulators:exec --only auth,functions,firestore --project demo-becoming "npm run test:e2e:auth:run"',
  );
} finally {
  for (const emulatorFile of emulatorFiles) {
    const snapshot = snapshots.get(emulatorFile.path);

    if (snapshot === null) {
      await rm(emulatorFile.path, {force: true});
    } else if (snapshot !== undefined) {
      await writeFile(emulatorFile.path, snapshot, {flag: 'w'});
    }
  }
}
