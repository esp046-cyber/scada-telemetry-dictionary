// Bundles TS with code splitting, minifies, copies offline data + CSS into /public.
import { build } from 'esbuild';
import { execSync } from 'node:child_process';
execSync('node scripts/build-terms.mjs', { stdio: 'inherit' });
import { cpSync, readFileSync, writeFileSync } from 'node:fs';
await build({ entryPoints: ['src/js/main.ts'], bundle: true, splitting: true, format: 'esm', outdir: 'public/js', minify: true, sourcemap: true, target: 'es2020' });
await build({ entryPoints: ['src/css/main.css'], bundle: true, outfile: 'public/main.css', minify: true });
cpSync('database/terms.json', 'public/terms.json');
const v = Date.now().toString(36);
writeFileSync('public/sw.js', readFileSync('src/js/sw.js', 'utf8').replace('__VERSION__', v));
console.log('Built', v);
