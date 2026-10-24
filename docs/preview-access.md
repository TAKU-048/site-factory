# 確認用プレビューの見せ方（Cloudflare Access のメール認証）

決定（2026-10-22）：制作途中のサイトは、Cloudflare Access のメール認証で、許可したメールアドレスの人だけが見られるようにして、お客様に確認してもらう。

## お客様ごとの手順
1. プレビュー用のWorkerを公開する（Wranglerで deploy/previews/<顧客ID>-preview.wrangler.jsonc を指定）。
   URL：https://<顧客ID>-preview.tk-sites.workers.dev
2. Cloudflareダッシュボード → Workers & Pages → 該当のWorker → 設定 → ドメインとルート（Domains & Routes）
   → workers.dev の行で「Cloudflare Access を有効にする（Enable Cloudflare Access）」を押す。
3. 「Cloudflare Access を管理（Manage Cloudflare Access）」で、許可するメールアドレスに
   お客様の申込メールアドレスと、takuma.yamaura@gmail.com を入れる。
4. お客様にURLを送る。開くとメールアドレスの入力画面が出て、届いたコードを入れると見られる。
5. 公開（本番）が終わったら、プレビュー用のWorkerは停止する。
6. Zero Trust → ユーザー一覧から、公開が終わったお客様を外す（無料は50ユーザーまで。ログインした人がユーザーとして数えられるため）。

## 未確認（試し公開で確かめる）
- Zero Trust の初回の組織作成で、支払い方法の登録が求められるか（無料プランは50ユーザーまで$0）。
- 既定のログイン方法がメールのワンタイムコード（One-time PIN）になっているか。
- 許可したメールアドレス以外では開けないこと。

出典：developers.cloudflare.com/workers/configuration/cloudflare-access/ 、developers.cloudflare.com/changelog/post/2025-10-03-one-click-access-for-workers/

## 契約（2026-10-22）
Zero Trust Free を有効化（ユーザー判断）。月0ドル・50ユーザーまで。有効化の条件として、無料枠を超えた使用量をカード（末尾9118）に請求することを許可している。人数は上の手順6で管理する。

## 実際に動いた手順（2026-10-22 preview-test で確認）
1. Wranglerで公開：deploy/previews/preview-test.wrangler.jsonc
2. Workers & Pages → preview-test → 「Access」タブ →「この Worker を Access で保護する」
   スコープ「すべての Traffic」、認証ポリシーは「Cloudflare アカウント」を選んで適用
3. Zero Trust Free を有効化（初回のみ。月0ドル、超過時のカード請求を許可）。チーム名は自動で fancy-resonance-5c55
4. ポリシー「Cloudflare account members」に「含める（OR）」でメール takuma.yamaura@gmail.com を追加
5. Zero Trust → Access コントロール → アプリケーション → preview-test →「ログイン方法」で One-time PIN のみにチェックして保存
   （利用可能なすべてのIDプロバイダーを受け入れる・インスタント認証はオフ）
6. 結果：シークレットウィンドウで開くとメール入力画面 → 届いたPINで表示できた（ユーザー確認）

## 注意
- 「Cloudflare account members」は共通のポリシー。実際のお客様のメールアドレスはここに足さない（ほかのお客様のプレビューも開けてしまう）。
  お客様ごとに専用ポリシー（含める：メール＝お客様のアドレス＋takuma.yamaura@gmail.com）を作り、そのお客様のプレビューにだけ付ける。
- 許可していないメールアドレス（contact@tk-creative.org）ではコードが届かないことを確認（2026-10-22、ユーザー確認）。
