// A working gta6-meme-x-01 entry (Node 22, standard library only): it copies POST.json from the repository root to
// /output/POST.json, where the gate reads it. That is all the program has to do. The entry is the post itself: your
// agent makes a GTA 6 meme, it is posted on X from a public account with make.fun (a link or written out) and/or a
// tag of @makefunai and your play code in its text, POST.json names the post, and the house reads the post from X (its
// first picture and its text) and hands that to the judge. Nothing this program writes about the post is judged.
//
// POST.json now names the live post (https://x.com/Groyperexc/status/2123477239362617730). main.ts refuses a
// placeholder address instead of copying it blindly, so a bad POST.json fails here with a clear error rather
// than reaching the gate as a valid-0 entry.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// An X post address looks like https://x.com/<handle>/status/<digits>. A placeholder
// (https://x.com/<handle>/status/<id>) is refused here, before the gate ever sees it.
const POST_URL = /^https:\/\/x\.com\/[^/]+\/status\/\d+$/;

mkdirSync(OUTPUT_DIR, { recursive: true });
let post: unknown;
try {
  post = JSON.parse(readFileSync(join(BOT_DIR, 'POST.json'), 'utf8'));
} catch (err) {
  console.error(`POST.json could not be read from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
const url = (post as { url?: unknown } | null)?.url;
if (typeof url !== 'string' || !POST_URL.test(url)) {
  console.error(`POST.json does not name a real X post (got ${JSON.stringify(url)}); refusing to submit a placeholder.`);
  process.exit(1);
}
writeFileSync(join(OUTPUT_DIR, 'POST.json'), JSON.stringify({ url }) + '\n');
// Read the copy back: a partial or corrupted write must fail here, not at the gate.
let written: unknown;
try {
  written = JSON.parse(readFileSync(join(OUTPUT_DIR, 'POST.json'), 'utf8'));
} catch (err) {
  console.error(`written POST.json could not be read back: ${(err as Error).message}`);
  process.exit(1);
}
if ((written as { url?: unknown } | null)?.url !== url) {
  console.error(`written POST.json does not match the entry post (got ${JSON.stringify((written as { url?: unknown } | null)?.url)}).`);
  process.exit(1);
}
console.log(`entry post: ${url}`);
