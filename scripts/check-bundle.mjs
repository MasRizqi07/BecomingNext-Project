import {readFile, readdir} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';

const MAX_ENTRY_GZIP_BYTES = 180 * 1024;
const MAX_CHUNK_GZIP_BYTES = 130 * 1024;
const indexHtml = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const entryMatch = indexHtml.match(/<script[^>]+src="\/assets\/(index-[^"]+\.js)"/);

if (!entryMatch?.[1]) {
  throw new Error('Unable to identify the production entry bundle.');
}

const assetsDirectory = new URL('../dist/assets/', import.meta.url);
const javascriptFiles = (await readdir(assetsDirectory)).filter((file) => file.endsWith('.js'));
const measurements = await Promise.all(
  javascriptFiles.map(async (file) => ({
    file,
    gzipBytes: gzipSync(await readFile(new URL(file, assetsDirectory))).byteLength,
  })),
);

const entry = measurements.find(({file}) => file === entryMatch[1]);
if (!entry || entry.gzipBytes > MAX_ENTRY_GZIP_BYTES) {
  throw new Error(
    `Entry bundle exceeds ${MAX_ENTRY_GZIP_BYTES} gzip bytes: ${entry?.gzipBytes ?? 'missing'}`,
  );
}

const oversizedChunk = measurements.find(
  ({file, gzipBytes}) => file !== entry.file && gzipBytes > MAX_CHUNK_GZIP_BYTES,
);
if (oversizedChunk) {
  throw new Error(
    `Chunk ${oversizedChunk.file} exceeds ${MAX_CHUNK_GZIP_BYTES} gzip bytes (${oversizedChunk.gzipBytes}).`,
  );
}

console.log(
  `Bundle budget passed: entry ${(entry.gzipBytes / 1024).toFixed(1)} KiB gzip; ${measurements.length} JS chunks.`,
);
