#!/usr/bin/env node
// お客様サイトの公開前チェック（日本語の機械的なミス・会社情報の食い違い・仮の文字の残り）
// 使い方: node tools/check-site-text.mjs --brief briefs/<顧客>.json --dist clients/<顧客>/dist [--out records/precheck-<顧客>.md]
// 結果: 問題があれば終了コード1。ページの本文を書き出したテキスト（AIが読んで校正する用）も出力する。
// 2026-10-24 ユーザー指示「ヒアリングシートを元にサイトを作ったら、確認を取る前に日本語のミスや会社情報の記載ミスがないかチェック」により追加。
import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1]]] : a), []));
if (!args.brief || !args.dist) { console.error('--brief と --dist を指定してください'); process.exit(2); }
const brief = JSON.parse(fs.readFileSync(args.brief, 'utf8'));
const c = brief.company || {};
const isDemo = !!brief.demo;

// --- ページの本文を取り出す ---
function walk(d) { return fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? (e.name === '_astro' ? [] : walk(path.join(d, e.name))) : (e.name.endsWith('.html') ? [path.join(d, e.name)] : [])); }
const ent = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ', '&copy;': '©', '&yen;': '¥' };
function textOf(html) {
  let s = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ');
  const attrs = [...s.matchAll(/\s(?:alt|title|placeholder|aria-label|content)="([^"]*)"/gi)].map(m => m[1]);
  s = s.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|h[1-6]|li|div|section|tr|dt|dd|figcaption|button|a|label|option)>/gi, '\n').replace(/<[^>]+>/g, ' ');
  const dec = t => t.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&[a-z#0-9]+;/gi, m => ent[m] ?? m);
  return { body: dec(s).split('\n').map(l => l.replace(/[ \t]+/g, ' ').trim()).filter(Boolean).join('\n'), attrs: attrs.map(dec) };
}
const pages = walk(args.dist).map(f => { const t = textOf(fs.readFileSync(f, 'utf8')); return { file: path.relative(args.dist, f), ...t }; });
const all = pages.map(p => p.body + '\n' + p.attrs.join('\n')).join('\n');

const issues = []; // {level:'エラー'|'注意', what, where, detail}
const add = (level, what, where, detail) => issues.push({ level, what, where, detail });
const where = re => pages.filter(p => re.test(p.body) || p.attrs.some(a => re.test(a))).map(p => p.file).join(', ') || '-';
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const norm = s => (s || '').normalize('NFKC').replace(/\s+/g, '');

// --- 1. 会社情報がヒアリング（企業情報ファイル）どおりに載っているか ---
const allN = norm(all);
for (const [key, label] of [['name', '会社名'], ['phone', '電話番号'], ['email', 'メールアドレス'], ['address', '所在地']]) {
  const v = (c[key] || '').trim();
  if (isDemo && key !== 'name') continue;
  if (!v) { if (key !== 'phone') add('注意', `${label}が企業情報ファイルに入っていない`, '-', 'ヒアリングシートの回答を確認'); continue; }
  if (!allN.includes(norm(v))) add('エラー', `${label}がサイトに見当たらない（表記が違う可能性）`, '-', `企業情報ファイル: ${v}`);
}
// 電話番号：載っている番号がすべて企業情報ファイルの番号と一致するか
const digits = s => (s || '').normalize('NFKC').replace(/\D/g, '');
const telRe = /(?:0\d{1,4}[-‐－ー\s]?\d{1,4}[-‐－ー\s]?\d{3,4})/g;
const phones = new Set([...all.normalize('NFKC').matchAll(telRe)].map(m => m[0]).filter(t => digits(t).length >= 10 && digits(t).length <= 11));
for (const t of phones) if (c.phone && digits(t) !== digits(c.phone)) add('エラー', '企業情報と違う電話番号が載っている', where(new RegExp(esc(t))), `${t}（正しくは ${c.phone}）`);
// メールアドレス
const mails = new Set([...all.matchAll(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g)].map(m => m[0].toLowerCase()));
for (const m of mails) if (c.email && m !== c.email.toLowerCase()) add('注意', '企業情報と違うメールアドレスが載っている', where(new RegExp(esc(m), 'i')), `${m}（企業情報: ${c.email}）`);
// 郵便番号
const zipIn = s => [...(s || '').normalize('NFKC').matchAll(/〒?\s?(\d{3})-?(\d{4})/g)].map(m => m[1] + '-' + m[2]);
const zipOk = zipIn(c.address)[0];
for (const z of new Set(zipIn(all.replace(telRe, ' ')))) if (zipOk && z !== zipOk) add('エラー', '企業情報と違う郵便番号が載っている', where(new RegExp(z.replace('-', '-?'))), `${z}（正しくは ${zipOk}）`);
// 会社名の表記ゆれ（株式会社の位置・全角半角）
if (c.name) {
  const core = c.name.replace(/（.*?）|\(.*?\)/g, '').replace(/株式会社|有限会社|合同会社|\s/g, '');
  const forms = new Set([...all.matchAll(new RegExp(`(株式会社|有限会社|合同会社|（株）|\\(株\\)|㈱|（有）|㈲)?\\s?${esc(core)}\\s?(株式会社|有限会社|合同会社|（株）|\\(株\\)|㈱)?`, 'g'))].map(m => m[0].trim()));
  if (forms.size > 1) add('注意', '会社名の書き方が複数ある', '-', [...forms].join(' / '));
}

// --- 2. 仮の文字・作業用の文字の残り ---
const placeholders = ['TODO', 'FIXME', '要決定', '要確認', '仮テキスト', 'ダミー', 'Lorem', 'lorem ipsum', 'XXXX', '〇〇', '○○', '●●', '△△', '差し替え予定', 'テキストが入ります', 'undefined', 'null', 'NaN', '[object Object]'];
if (!isDemo) placeholders.push('制作デモ', '架空', 'example.com', 'example.invalid');
for (const w of placeholders) { const re = new RegExp(esc(w), 'i'); if (re.test(all)) add('エラー', `仮の文字が残っている「${w}」`, where(re), ''); }

// --- 3. 日本語の機械的なミス（文章の自然さはAIが本文テキストを読んで確認する） ---
const jp = '[\\u3040-\\u30ff\\u4e00-\\u9fff]';
const checks = [
  [/。。|、、|！！！|？？|，，|．．/, '句読点が重なっている'],
  [/([をがにでへ])\1(?![ゃゅょ])/, '助詞が重なっている（「をを」「にに」など）'],
  [/　/, '全角スペースが入っている'],
  [/[ｦ-ﾟ]/, '半角カタカナが使われている'],
  [new RegExp(`${jp}[!?](?![=])`), '日本語のあとに半角の「!」「?」が使われている'],
  [/[,.](?=[぀-ヿ一-鿿])/, '日本語の文中に半角の「,」「.」が使われている'],
  [/[（(][^）)]*$/m, 'かっこが閉じていない行がある'],
  [/「[^」]*$/m, '「 」が閉じていない行がある'],
];
for (const p of pages) for (const line of [...p.body.split('\n'), ...p.attrs]) for (const [re, what] of checks) if (re.test(line)) add('注意', what, p.file, line.slice(0, 80));
// 日本語の間の半角スペース（1つの文字のかたまりの中だけを見る。要素の境目は対象外）
const spRe = new RegExp(`${jp} +${jp}`);
for (const f of walk(args.dist)) { const h = fs.readFileSync(f, 'utf8').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, ''); for (const m of h.matchAll(/>([^<]+)</g)) { const t = m[1].replace(/\s*\n\s*/g, ''); if (spRe.test(t)) add('注意', '日本語の間に半角スペースが入っている', path.relative(args.dist, f), t.trim().slice(0, 80)); } }
// 全角数字と半角数字の混在
if (/[０-９]/.test(all) && /[0-9]/.test(all)) add('注意', '全角数字と半角数字が混ざっている', where(/[０-９]/), '表記をそろえる');
// 画像の説明（alt）がない
for (const f of walk(args.dist)) { const h = fs.readFileSync(f, 'utf8'); const n = [...h.matchAll(/<img(?![^>]*\balt=)[^>]*>/gi)].length; if (n) add('注意', `画像の説明（alt）がない画像が${n}枚`, path.relative(args.dist, f), ''); }

// --- 出力 ---
const errors = issues.filter(i => i.level === 'エラー');
const lines = [`# 公開前チェック（${c.name || ''}）`, '', `- ページ数: ${pages.length}`, `- エラー: ${errors.length}件 / 注意: ${issues.length - errors.length}件`, ''];
const seen = new Set();
for (const i of issues) { const k = i.level + i.what + i.where + i.detail; if (seen.has(k)) continue; seen.add(k); lines.push(`- [${i.level}] ${i.what}（${i.where}）${i.detail ? '：' + i.detail : ''}`); }
lines.push('', '## 校正用の本文（AIがこの文章を読んで、誤字脱字・不自然な日本語・敬語・表記ゆれを確認する）', '');
for (const p of pages) lines.push(`### ${p.file}`, '', p.body, '', p.attrs.length ? '（画像の説明など）\n' + p.attrs.filter(Boolean).join('\n') : '', '');
const report = lines.join('\n');
if (args.out) { fs.mkdirSync(path.dirname(args.out), { recursive: true }); fs.writeFileSync(args.out, report); console.log(`書き出し: ${args.out}`); }
console.log(lines.slice(0, 5 + seen.size).join('\n'));
process.exit(errors.length ? 1 : 0);
