# EmDash（Cloudflare の CMS）を使うときの手順

2026-10-28 ユーザー指示「このサービスでサイトを作るときに、Cloudflare の EmDash を取り入れて、必要な時に使えるように」により追加。

## EmDash とは

- Cloudflare が公開している、WordPress の代わりになる CMS（記事やページを管理画面から編集できる仕組み）。MIT ライセンス。
- 中身は Astro（この制作システムと同じ）。管理画面は `/_emdash/admin`。ログインはパスキー（指紋・顔認証など）が基本で、パスワードを使わない。
- PHP を使わないため、php2shell のような PHP の脆弱性の影響を受けない（AGENTS.md の「PHP・WordPress を使わない」決まりに合う）。
- プラグインは隔離された環境で動き、許可したことしかできない。
- WordPress からの記事・ページ・画像の取り込みができる。
- 出典：https://github.com/emdash-cms/emdash（README）、https://docs.emdashcms.com/

## いつ使うか

通常の制作（engine の validate → propose → create、静的なサイト）はこれまでどおり。EmDash は「必要な時」だけ使う選択肢として用意している。

使う場面の例（どれを使うかは案件ごとにユーザーが決める）：

- お客様が自分でお知らせ・ブログ・施工事例などを書き足したい
- 予約投稿（決まった日時に公開）を使いたい
- 今 WordPress で作られているサイトを移したい

注意：今のサービスのページ（web-subscription.html）には「お客様用の編集画面はありません」と書いてある。EmDash でお客様に管理画面を渡す場合は、サービスの条件とページの記載をユーザーと決め直してから行う。

## 静的なサイトとの違い（費用・運用）

| | 通常（静的） | EmDash |
|---|---|---|
| 表示のしかた | 作ったHTMLをそのまま配信 | 開くたびにサーバー側で組み立てる（Workers） |
| 使う Cloudflare の機能 | Workers（静的ファイル） | Workers ＋ D1（データベース）＋ R2（画像置き場）＋ 毎分のCron |
| 費用 | 無料枠内 | 小さなサイトなら無料枠内の見込み。R2 はアカウントで有効化が必要 |
| プラグインの隔離実行 | — | Workers 有料プラン（月5ドル）が必要。使わなければ不要（初期設定は「使わない」） |
| バックアップ | ファイルだけ | ファイル ＋ D1 ＋ R2 ＋ 暗号化キー |

## 1. 土台を作る

```bash
node tools/new-emdash-site.mjs <顧客ID> --template starter --install
```

- `--template` は `starter`（汎用）／`blog`（ブログ）／`marketing`（LP型）／`portfolio`（作品集）。
- `clients/<顧客ID>-cms/` に、動作確認した版のテンプレートが入る（版は tools/new-emdash-site.mjs の `TEMPLATES_COMMIT`）。
- 暗号化キーは `clients/<顧客ID>-cms/.dev.vars` に作られる（Git には入らない）。
- デザインは AGENTS.md・デザイン品質・外部リソース運用.md の決まりどおり、テンプレートの見た目のまま納品しない。

## 2. ローカルで確認する

```bash
cd clients/<顧客ID>-cms
npx astro dev
```

- サイト：http://localhost:4321/
- 管理画面：http://localhost:4321/_emdash/admin （初回は設定画面が出る）
- 2026-10-28 に starter テンプレートで `npm install` → `astro build` → `astro dev`（トップ 200、管理画面への移動）まで動くことを確認済み。

## 3. 作り込み

- EmDash の書き方は `vendor/emdash-skills/`（EmDash 公式のエージェント用手順書、MIT、版 ec03a5e0f6c3a836ea33f3547d8f22e87e0901a3）を読む。
  - サイトの作り込み：`vendor/emdash-skills/building-emdash-site/SKILL.md`
  - 管理用のコマンド：`vendor/emdash-skills/emdash-cli/SKILL.md`
  - WordPress のテーマ・プラグインの移行：`vendor/emdash-skills/wordpress-theme-to-emdash/`、`wordpress-plugin-to-emdash/`
  - プラグインを作る：`vendor/emdash-skills/creating-plugins/`
  - 版を上げる：`vendor/emdash-skills/upgrading-emdash/SKILL.md`
- 公開前チェック（AGENTS.md の決まり）は EmDash のサイトでも行う。EmDash のページはサーバー側で組み立てるため `dist` に HTML が出ない。ローカルで `astro dev` を動かし、ページを開いて本文を確認する。

## 4. 公開する（ユーザーの承認後）

1. Cloudflare にログイン：`npx wrangler login`（ユーザーが行う）
2. 本番用の暗号化キーを入れる：`npx emdash secrets generate` で作った値を `npx wrangler secret put EMDASH_ENCRYPTION_KEY` で入れる。値はユーザーのパスワード管理にも保管する（失うとプラグインの秘密設定が読めなくなる）。
3. `npm run build` → `npx wrangler deploy`。初回の公開で D1 と R2 が wrangler.jsonc の名前で作られる。
4. 公開したURLの `/_emdash/admin` を開き、初回設定と管理者の登録（パスキー）を行う。
5. 予約投稿を使う場合は `npx emdash doctor` で「scheduler wiring」が通ることを確認する。

## 版を上げる

1. https://github.com/emdash-cms/templates の新しい版で、一時フォルダで手順1〜2が動くことを確認する。
2. 問題なければ `tools/new-emdash-site.mjs` の `TEMPLATES_COMMIT` を書き換え、このファイルの確認日を更新する。
3. 公開済みのお客様サイトは `vendor/emdash-skills/upgrading-emdash/SKILL.md` に従って個別に上げる。
