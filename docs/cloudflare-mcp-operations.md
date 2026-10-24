# Cloudflare MCP：Codex・Claude共通運用

2026-10-19。ユーザーがCloudflare MCP経由でCodex・Claudeから作成・修正できる構成を指示。接続設定を登録済み。Codex・ClaudeのOAuth成功を確認済み。Claude CLIの実接続ヘルスはConnected。実アカウント・Workers・D1一覧を公式MCPで読み取り済み。HTTP200、1アカウント・Workers0・D1 0。

## 登録先と実確認

| クライアント | この案件の設定 | 確認結果 |
|---|---|---|
| Codex | .codex/config.toml | codex mcp get cloudflare-api --jsonでenabled:true、公式URLを確認 |
| Claude Code | .mcp.json | Project config／http／Connectedを実確認。OAuth成功。settings.local.jsonでcloudflare-apiのみ有効化 |

共通名cloudflare-api、URLはhttps://mcp.cloudflare.com/mcp。公式のStreamable HTTP型を使用し、追加パッケージやmcp-remoteを取得しない。設定にAPIトークン・Authorizationヘッダー・OAuth秘密情報を保存しない。グローバル設定・他案件のMCPは変更していない。

認証情報なしのinitialize要求に実HTTP401とOAuth challengeを確認。これは公式サーバーへの到達確認であり、Workers一覧・アカウント権限の確認ではない。プラグイン検索ではCloudflare候補がなかったため、公式MCPを直接登録した。

## 初回の認証

- Codex：この案件のMCP設定でcloudflare-apiを認証する。CLIの場合は案件フォルダで `codex mcp login cloudflare-api --scopes offline_access,user:read,account:read,workers-scripts.read,workers-scripts.write,d1.read,d1.write`。既定の全サービスscopeは使わず、実際に必要な範囲を明示する。ログインはブラウザを開く可能性があるので、エージェントが開始するときはユーザーのブラウザ許可を先に得る。
- Claude Code：この案件で起動し、案件用MCPを承認して `/mcp` からcloudflare-apiを認証する。Pending approvalとOAuth未認証は別の状態。
- Cloudflare画面で対象アカウントと付与権限を本人が確認する。まず参照に必要な権限を基本とし、Worker／D1の作成・編集に必要な権限は公開段階の対象・操作に合わせる。DNS変更や包括的な管理権限を一律に要求しない。
- 認証は各クライアントで行う。一方の認証情報をファイルへ取り出して他方へコピーしない。秘密値をチャット・管理台帳・Gitへ貼らない。
- 設定を再読込してツールが利用可能になった後、実アカウントのID・Workers一覧・D1一覧のメタデータだけを読み、認証完了を記録する。認証前に接続済みと報告しない。

## 作成・修正の共通手順

1. AGENTS.md、CLAUDE.mdと最新の進捗を読み、同じ案件フォルダのclients/<顧客ID>を使う。Cloudflare上のリソース名だけで対象を推測しない。
2. Cloudflare MCPで対象アカウント・Worker・D1・ドメインの実物と保存済みIDを照合する。MCPのsearchでAPI仕様を絞り、executeのコードもGET参照と変更処理を区別する。取得結果は必要なメタデータに絞り、全社ログ・問い合わせ本文を一括取得しない。
3. 原稿・デザイン・機能はローカルの顧客ソースを修正し、検証して固定候補を作る。MCP上で直接修正した内容だけが残る状態にしない。共通エンジンの更新を全顧客へ自動適用しない。
4. アカウント／リソースID／候補ID／差分／予定費用を具体化する。本番公開・課金・DNS変更・削除・外部メール送信は既存ルールどおり事前確認。MCP接続の許可は、それらの包括的な許可ではない。
5. 承認済み候補に対して、MCPでリソース・設定・公開版を管理する。静的アセットの転送など、MCPで正確に扱えるか未検証の操作は既存Wranglerとの役割分担を先に確認する。MCPだけで全ファイル転送が完了すると仮定しない。B1のローカル専用ラッパーにremoteフラグを足して本番用へ流用しない。
6. 公開後はHTTP応答、SSL、正規ドメイン、フォーム保存、通知、公開バージョンを実測する。API成功だけで完成としない。B1では実配送・本番公開をまだ検証していない。
7. アカウントID・zone ID・Worker名／ID・D1 ID・候補ID・公開バージョン・確認日時を、顧客別の非公開運用設定と台帳へ記録する。認証情報は含めない。CodexとClaudeが同時に同じ顧客を更新しない。

## 現時点の境界

MCP設定登録・両クライアントOAuth・公式MCPでのアカウント／Workers／D1参照は完了。現契約・書込権限の実照合、実リソース作成・更新、バンドル転送、公開、DNS、実配送は未検証。B2接続時に順に確認する。B1の検証記録はrecords/cloudflare-b1-quality.md。

## 公式根拠

- [Cloudflare公式MCP一覧・OAuth・API MCP](https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/)
- [Codex MCPの案件設定・OAuth](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)
- [Claude CodeのHTTP MCP・案件設定・認証](https://code.claude.com/docs/en/mcp)

公式情報でも旧SSE／mcp-remote手順が残ることがある。この案件では現在の公式API MCPの/mcpと、各クライアントのHTTPネイティブ対応を優先する。

更新：Claude .mcp.jsonのoauth.scopesもWorkers/D1へ固定。本人の連携指示に従い、.claude/settings.local.jsonのenabledMcpjsonServersへcloudflare-apiだけを設定。全MCPの包括承認や権限チェックの無効化はしない。このローカル設定はGit対象外。現在のCodexチャットでは追加MCPツールがまだ露出しておらず、ログイン成功と実アカウント操作の確認を区別する。

認証完了確認：CodexはSuccessfully logged in、ClaudeはAuthenticated with cloudflare-apiと、認証後のgetでConnectedを確認。最初のClaudeヘルス確認はOAuth保存より早くNeeds authenticationになったが、完了通知後の再確認でConnectedへ変わった。現在のCodexチャットにCloudflareツールは未露出。MCP設定を再読み込みしたクライアントで、アカウント・Worker・D1のメタデータ参照を最初に行う。ツール一覧が更新されるまで実アカウント操作を実行したと報告しない。

2026-10-19 再開後：このチャットへCloudflareのdocs/search/execute/whoamiが反映された。GETで1アカウント・Workers0・D1 0をHTTP200確認。workers.dev未設定（10007）、契約一覧は認証エラー10000で未確認。default_usage_model=standardのみではPaid契約を判定しない。記録はrecords/cloudflare/connection-check.json、次工程の案はdocs/cloudflare-b2-environment-proposal.md。以前のツール未露出・再読み込み不可の記述は当時の履歴で、現在は解消済み。
