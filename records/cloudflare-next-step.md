# Cloudflare MCP：次の実行で再開する地点

2026-10-19。ユーザーはCloudflare MCPでCodex・Claudeから作成・修正できる運用を指示し、両クライアントのOAuthを本人が承認済み。

## 実確認済み

- Codex CLI: Successfully logged in。案件設定cloudflare-api enabled:true。
- Claude CLI: Authenticated、認証後getでConnected。
- 公式URL https://mcp.cloudflare.com/mcp。
- scopeはoffline_access,user:read,account:read,workers-scripts.read,workers-scripts.write,d1.read,d1.write。全サービス権限ではない。
- 独立した公式app-serverのMCP inventoryでcloudflare-api/authStatus:oAuth、docs/search/execute/whoamiを確認。モデル実行・新規チャット作成なし。

## 以前の制限（2026-10-19再開後に解消）

実行中チャットのツールにはCloudflareが露出していない。既存アプリの制御ソケットがなく、CLI proxy経由のreload不可。別app-serverで現チャットを再接続する方法はactive writer競合で拒否されたため、それ以上試行しない。Computer UseによるCodex自身の画面操作も安全制限で禁止された。回避しない。

## ユーザー操作後の次手順

Codexを再起動し、このチャットへ戻って続行する。新しいチャットをエージェントが勝手に作らない。再開時はこのファイルとdocs/cloudflare-mcp-operations.mdを読む。

1. Cloudflare MCPツールの露出を確認。無ければ設定画面のサーバー有効状態を本人と確認する。認証は成功済みなので不要な再ログインを繰り返さない。
2. searchでGET /accounts、GET /accounts/{account_id}/workers/scripts、GET /accounts/{account_id}/d1/databaseの仕様を確認。
3. GET /accountsで対象を列挙。複数あるなら対象を本人に確認。アカウント名だけで推定しない。
4. 対象のWorkers・D1は名前／ID等のメタデータのみ取得し、問い合わせ本文は読まない。既存運用サイトを変更しない。
5. 参照結果からB2の検証先・リソース名・追加費用・公開手順を具体化する。作成／公開・課金・DNS・外部送信はまだ未承認。

Cloudflare資産の作成・変更は一切していない。アカウント／Workers／D1の一覧は未取得。B1のコード・試験はrecords/cloudflare-b1-quality.md。元の実装を作り直さない。

## 再開後の更新

このチャットにMCPが反映され、実参照まで完了。1アカウント・Workers0・D1 0をHTTP200確認。再起動や再ログインは繰り返さない。次はdocs/cloudflare-b2-environment-proposal.mdを元に、契約状態・サブドメイン・検証公開範囲を確認し、作成承認を得る。資産作成・公開・有料契約は未実施。
