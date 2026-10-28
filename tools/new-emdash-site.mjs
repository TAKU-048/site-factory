#!/usr/bin/env node
// EmDash（Cloudflare の CMS）でお客様サイトの土台を作る。
// 2026-10-28 ユーザー指示「サイトを作るときに Cloudflare の EmDash を取り入れて、必要な時に使えるように」により追加。
// 使い方の説明は docs/emdash.md。
//
//   node tools/new-emdash-site.mjs <顧客ID> [--template starter|blog|marketing|portfolio] [--install]
//
// できること：
//   ・clients/<顧客ID>-cms/ に EmDash の Cloudflare 用テンプレート（固定した版）を複製する
//   ・package.json の名前、wrangler.jsonc の Worker 名・D1 名・R2 名を顧客IDに合わせる
//   ・暗号化キーを .dev.vars（Gitに入れない）に作る
//   ・--install のときだけ npm install まで行う
// しないこと：Cloudflare への公開、D1・R2 の作成（docs/emdash.md の手順で、承認後に行う）
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 動作確認した版（2026-10-28）。上げるときは docs/emdash.md の「版を上げる」の手順で確認してから変える。
const TEMPLATES_REPO = 'https://github.com/emdash-cms/templates';
const TEMPLATES_COMMIT = 'a7bb43df40b2a1dbc63495579be612837e95aa2e';
const TEMPLATES = ['starter', 'blog', 'marketing', 'portfolio'];

const argv = process.argv.slice(2);
const id = argv.find(a => !a.startsWith('--'));
const tIdx = argv.indexOf('--template');
const template = tIdx > -1 ? argv[tIdx + 1] : 'starter';
const install = argv.includes('--install');

if (!id || !/^[a-z0-9][a-z0-9-]{1,40}$/.test(id)) {
  console.error('顧客IDを半角英小文字・数字・ハイフンで指定してください（例：node tools/new-emdash-site.mjs yamada-koumuten）');
  process.exit(2);
}
if (!TEMPLATES.includes(template)) {
  console.error(`--template は ${TEMPLATES.join(' / ')} のどれかです`);
  process.exit(2);
}

// 日本語のフォルダ名でも正しく動くよう fileURLToPath を使う
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dest = path.join(root, 'clients', `${id}-cms`);
if (fs.existsSync(dest) && fs.readdirSync(dest).length) {
  console.error(`すでにあります：${path.relative(root, dest)}（上書きしません）`);
  process.exit(1);
}

// フォルダを中身ごと写す（ファイルの権限や日時は写さない。共有フォルダでも動くように）
function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) copyDir(a, b);
    else if (e.isFile()) fs.writeFileSync(b, fs.readFileSync(a));
  }
}

// 1. 固定した版のテンプレートを一時フォルダに取得
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'emdash-tpl-'));
try {
  const git = (...a) => execFileSync('git', a, { cwd: tmp, stdio: 'pipe' });
  git('init', '-q');
  git('remote', 'add', 'origin', TEMPLATES_REPO);
  git('fetch', '-q', '--depth', '1', 'origin', TEMPLATES_COMMIT);
  git('checkout', '-q', 'FETCH_HEAD');
  const src = path.join(tmp, `${template}-cloudflare`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  copyDir(src, dest);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

// 2. 名前を顧客IDに合わせる
const pkgPath = path.join(dest, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.name = `${id}-cms`;
delete pkg.packageManager; // テンプレートは pnpm 前提。制作システムでは npm を使う
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

const wPath = path.join(dest, 'wrangler.jsonc');
let w = fs.readFileSync(wPath, 'utf8');
w = w.replace(/"name":\s*"[^"]*"/, `"name": "${id}-cms"`)
     .replace(/"database_name":\s*"[^"]*"/, `"database_name": "${id}-cms"`)
     .replace(/"bucket_name":\s*"[^"]*"/, `"bucket_name": "${id}-cms-media"`);
fs.writeFileSync(wPath, w);

// 3. 暗号化キー（.dev.vars はローカル用。本番は wrangler secret put で別に入れる）
fs.writeFileSync(path.join(dest, '.dev.vars'), `EMDASH_ENCRYPTION_KEY=emdash_enc_v1_${randomBytes(32).toString("base64url")}\n`);
const gi = path.join(dest, '.gitignore');
const giText = fs.existsSync(gi) ? fs.readFileSync(gi, 'utf8') : '';
const need = ['.dev.vars', '.wrangler/', 'node_modules/', 'dist/'].filter(l => !giText.split('\n').includes(l));
if (need.length) fs.appendFileSync(gi, (giText && !giText.endsWith('\n') ? '\n' : '') + need.join('\n') + '\n');

fs.writeFileSync(path.join(dest, 'EMDASH-SOURCE.txt'),
  `EmDash テンプレート：${TEMPLATES_REPO}\n版：${TEMPLATES_COMMIT}\n種類：${template}-cloudflare\n作成日：${new Date().toISOString().slice(0, 10)}\nライセンス：MIT（Cloudflare Inc.）\n`);

// 4. 依存の取得（指定時のみ）
if (install) execFileSync('npm', ['install', '--no-audit', '--no-fund'], { cwd: dest, stdio: 'inherit' });

console.log(`作成しました：${path.relative(root, dest)}（${template}）`);
console.log('次の手順は docs/emdash.md の「2. ローカルで確認する」から。');
