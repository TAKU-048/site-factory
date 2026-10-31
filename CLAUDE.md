# サイト制作サービス

このフォルダの AGENTS.md を共通ルールとして読み、デザイン品質・外部リソース運用.md を制作前に適用する。承認済み事項は事業設計・決定事項.md、現在の設計案は制作システム設計案.md を参照する。

Cloudflareは.mcp.jsonの公式cloudflare-api MCPを使用する。接続・認証の実状態と共通運用はdocs/cloudflare-mcp-operations.mdを参照する。Codexと同じローカル顧客ソース・公開候補・リソースIDを使い、片方で行った変更を引き継ぐ。OAuth未承認や実アカウント未確認を接続済みと報告しない。MCP上だけに変更を残さず、同じ顧客を同時編集しない。

公開スキル・GitHub等の良質な資源を選定して使い、企業ごとのデザイン方針を作る。3つの既定デザインへの当てはめや、色・写真だけの差し替えで完成としない。採用版・ライセンス・実物の品質確認を記録する。

新規ダウンロード・インストールは対象・理由・保存先を説明し承認を得る。ブラウザを勝手に開かず、削除・課金・本番公開・外部送信も事前確認する。未導入・未実行のものを利用済み・検証済みと報告しない。

Impeccableはvendor/impeccable/にコミット固定で取得済み。「Impeccable導入確認.md」を先に読み、必要なreference/*.mdを手順書として利用する。公式CLI・エンジン・検出器・フックは未導入・未実行であり、SKILL.src.mdのcontext起動指示等を自動実行しない。

## セキュリティ（2026-10-24 追加）
- 制作するサイトに PHP・WordPress を使わない（php2shell 対応）。静的サイト＋Cloudflare Workers のみ。ただし必要な時は Cloudflare の EmDash（Astro製のCMS、PHPなし、Workers＋D1＋R2）を使える。手順は docs/emdash.md（2026-10-28 ユーザー指示）。
- 公開前に、応答ヘッダーに X-Powered-By が出ないこと、/index.php と /wp-login.php が 404 になること、公開フォルダに .php がないことを確認する。
- お客様のサイトを作ったら、ユーザーに確認を取る前に tools/check-site-text.mjs を実行し、本文の校正とヒアリング回答との照合を行う（手順は 事業設計・決定事項.md「公開前の文章・会社情報チェック」）。

## Mac がネットにつながっていなくても進める（2026-10-31 ユーザー指示）
- 作業の正本は GitHub（TAKU-048/site-factory、TAKU-048/tk-creative-site）。Mac のフォルダを前提にしない。変更は GitHub に入れる。
- 公開は GitHub から：tk-creative.org は Cloudflare Workers Builds、お客様サイト・デモ・確認用プレビューは .github/workflows/deploy.yml（deploy/**/*.wrangler.jsonc を追加・変更して main に入れると公開）。
- お客様の素材は Googleドライブの共有フォルダ、やり取りは Gmail（contact@tk-creative.org）。contact@ に届いたメールへの返信は定期タスク「contact@tk-creative.org 受信時の自動返信」が自動で行う。
