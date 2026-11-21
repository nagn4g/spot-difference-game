import * as files from 'node:fs';
import * as paths from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// Package this journal from its own directory, independent of the caller's cwd.
const source = new URL('.', import.meta.url);
const destination = paths.resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
if (destination === paths.resolve(fileURLToPath(source))) throw Error('Output must not replace the source directory');
const requiredShots = ['1-play.jpg', '2-scene2.jpg', '3-title.jpg', '4-complete.jpg'];
for (const name of requiredShots) {
  const image = new URL(`screenshots/${name}`, source);
  if (!files.existsSync(image)) throw Error(`Missing screenshots/${name}. Start node serve.ts, then run node shots.mjs on a host that permits Chrome.`);
}
files.mkdirSync(destination, { recursive: true });
for (const folder of ['game', 'screenshots']) {
  const target = paths.join(destination, folder);
  files.rmSync(target, { force: true, recursive: true });
  files.cpSync(new URL(folder, source), target, { recursive: true });
}
const dossier = buildDossier(destination, {
  text_max_bytes: 160 * 1024,
  screenshots: { max: 4, max_bytes: 256 * 1024 },
  game_max_files: 993,
  game_max_bytes: 48 * 1024 * 1024,
  game_path_max_bytes: 1000,
});
files.writeFileSync(paths.join(destination, 'dossier.json'), dossier);
console.log(`Afterlight packaged: ${dossier.length} dossier bytes.`);
