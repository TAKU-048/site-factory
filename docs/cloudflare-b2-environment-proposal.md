# B2の最初の作業：検証環境の作成案

2026-10-19。MCP接続は実確認済み。本ファイルの作成・公開作業は未承認。

## 実アカウントの状態

接続先は1アカウント。account IDはrecords/cloudflare/connection-check.jsonに記録した。公式MCPのGET /accounts、Workers一覧、D1一覧はいずれもHTTP200。Workers0件、D1 0件。本文・秘密値・実顧客情報の取得なし。

workers.devは未設定でAPIエラー10007。Workers Account SettingsはHTTP200、default_usage_model=standard。ただしこの値だけでWorkers Paid契約済みとは判断しない。契約一覧のGETは認証エラー10000で参照できなかった。再認証や課金権限の追加はまだ行っていない。

## 最初に作る候補

| 対象 | 提案名・扱い |
|---|---|
| アカウント用workers.dev | tk-creative-sites（未確保・利用可否未確認。取得できなければ別候補を確認） |
| 検証用Worker | site-factory-staging |
| 検証用D1 | site-factory-staging-contact、apacを配置希望。日本国内保存の保証ではない |
| プレビュー候補URL | https://site-factory-staging.tk-creative-sites.workers.dev（未作成） |
| 最初の公開内容 | 既存の未接続デモを基にした静的サイト。noindex・フォーム送信不可・架空企業の表示を維持 |

最初は独自ドメイン、Resend、有料プラン、通知Cronを有効化しない。D1は空の検証専用DBとして作成し、実送信対応の前にスキーマ・ロールバック等を別工程で検証する。B1のlocal認証省略エントリーをインターネットに公開しない。

プレビューを単にnoindexにするだけでは非公開にならない。認証なしのデモ公開を本人が認めるか、Cloudflare Access等を整備してから公開するかを承認時に明確にする。実顧客の素材・原稿は載せない。

## 実施順と停止条件

1. 現契約を本人の契約画面、または必要な参照権限を認めた方法で確認する。現在のMCPエラーだけで無料プランだと断定しない。契約状態不明のまま「無料」として作業しない。
2. サブドメイン・Worker・D1名、公開内容、公開／アクセス制限、追加費用の条件を承認する。
3. 既存一覧を再確認してから新規作成する。同名や既存リソースがあれば上書きしない。API成功結果の実IDを記録し、仮のIDで以降の設定を作らない。
4. 静的プレビュー用に固定候補を作る。MCPでリソース・設定・公開版を管理する。静的アセット転送の手段は、MCPの正式なupload session APIか既存Wranglerのどちらを使うかを実装計画で決める。未実装のremoteラッパーがあるように扱わない。
5. 承認したプレビューを公開し、HTTP200／404、noindex、フォーム送信不可、公開バージョンを実測する。MCPでWorker・D1の一覧を再取得して記録する。
6. 次に、Turnstile・保存・Resend・Webhook・再試行・本番設定を別のB2実装計画で進める。前段の作成許可を、本番公開や外部メール配送の包括許可にしない。

Cloudflare APIの応答によるとWorkers & Pagesダッシュボードを初めて開くこと自体でworkers.devが自動生成される場合がある。参照確認のつもりで勝手に開かず、サブドメイン作成の承認対象に含める。

## 費用の扱い

公式のWorkers Free／D1 Free範囲で検証する方針だが、現アカウントの契約と実使用量を確認してから確定する。本番の既定方針Workers Paid $5／月から＋Resend Pro $20／月は、この検証作業で自動契約しない。

参照：[Workers料金](https://developers.cloudflare.com/workers/platform/pricing/)、[Workers制限](https://developers.cloudflare.com/workers/platform/limits/)。公式MCP docsで2026-10-19確認。料金表の存在は現在のアカウント契約の証拠ではない。

## 2026-10-21 確定事項（ユーザー回答・作成は未承認）

| 項目 | 決定 |
|---|---|
| 現契約 | Workers Free（本人が請求画面で確認。API未照合） |
| workers.devサブドメイン | site-factory（空き状況は未確認。取れなければ再度本人に確認） |
| 検証用Worker | site-factory-staging |
| 検証用D1 | site-factory-staging-contact |
| プレビューURL候補 | https://site-factory-staging.site-factory.workers.dev（未作成） |
| 公開方法 | アクセス制限して公開（Cloudflare Access等）。認証なし公開はしない |
| 費用 | Free範囲。有料契約は行わない |

未確認事項：アクセス制限の具体的方法と無料範囲・必要な設定、現OAuth scopeでAccessを設定できるか（現scopeはWorkers/D1のみ）。作成・公開を実行する前に確認し、本人の作成承認を得る。

## 2026-10-21 未確認事項の調査結果（Claude、公式情報）

- workers.devはAccessで制限可能。本番workers.dev URL・Preview/Version URLを個別または両方保護できる。workers.devを無効化してもVersion/Preview URLは無効にならないため、Preview側もAccess対象に含めるか、preview_urlsを無効にする必要がある。出典：developers.cloudflare.com/workers/configuration/routing/workers-dev/、/workers/configuration/previews/
- Cloudflare Zero Trust（Access含むZTNA）はFreeプラン$0・50ユーザーまで。出典：cloudflare.com/plans/sase-zero-trust.md。Zero Trust組織の初回作成時に支払方法登録が必要かは公式ページに記載なく未確認（本人の画面で確認）。
- 現OAuth scope（Workers/D1）にはAccess・Zero Trustの権限がない。MCPでAccessを設定するにはscope追加の再認証が必要（本人承認）。またはダッシュボードで本人が設定。
- site-factoryの空き確認・作成は、このClaudeセッションにcloudflare-api MCPが露出していないため未実施。Mac上のClaude Code CLI（案件フォルダの.mcp.json）またはCodexで実行する。

## 2026-10-21 営業用デモの公開方針（ユーザー決定）

営業用デモは認証なしで誰でも閲覧できるように公開する。上記の検証環境（site-factory-staging）の「アクセス制限して公開」はそのまま。営業用デモの公開先・名称・noindexの扱いは未決定。Cloudflare上の作成・変更なし。

## 2026-10-21 workers.devサブドメインの変更（実作成済み）

`site-factory` は他者使用中で取得不可（Wrangler: Subdomain is unavailable）。ユーザーの選択で `tk-sites` を登録した（https://tk-sites.workers.dev）。検証用Workerの候補URLは https://site-factory-staging.tk-sites.workers.dev（未作成）に変わる。
同日、tk-creative.org の移転用Worker `tk-creative-site` をユーザーのMacからWrangler 4.151.1でデプロイ（静的配信＋トップURLのみindex.htmlを返す処理、workers.devのみ、独自ドメイン未切替）。設定は ~/tk-creative/wrangler.jsonc。Wranglerは標準の広いscopeでログイン済み（--scopes指定の誤りのため）。
