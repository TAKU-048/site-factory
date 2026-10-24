# Cloudflare B1：実装・実地検証結果

2026-10-19。ユーザー承認範囲のローカル版。実Cloudflare／Turnstile／Resendアカウントは未接続。課金、DNS変更、本番公開、外部メール配送、Cronの有効化は行っていない。

## 完成した機能

- 顧客別Worker／D1向けの受付・入力検証・原子的保存。
- requestIdによる重複防止、固定通知先、本文エスケープ。
- outboxの期限付き取得、同一キーでの再試行、24時間境界での停止、固定理由コードによる管理集計。
- ローカル専用フォームと失敗時入力保持、受付番号、成功後消去、エラーへのフォーカス。
- ソース・素材・ビルド・Worker・lock・設定を含む候補のハッシュ照合。候補をコピーして起動し、固定候補を保護。

## 最終の試験結果

| 対象 | 結果 | 記録 |
|---|---|---|
| 制作エンジン等のNodeテスト | 30件成功、失敗0 | b1-final-root-tests.log |
| Cloudflare用Nodeテスト | 15件成功、失敗0 | b1-final-runtime-tests.log |
| 実workerd／D1／ローカルHTTP | 2件成功、失敗0 | b1-local-final.log |
| engine／WorkerのTypeScript | 両方成功 | b1-final-*-check.log |
| QAサイトAstro check | 24ファイル、エラー・警告・ヒント0 | b1-form-check.log |
| QAサイトbuild | 7ページ出力、成功 | b1-form-build.log |
| 360／375／1280pxのフォーム | はみ出し0、48px未満0 | b1-browser.json |
| 送信ボタンの文字コントラスト | 透明度0.75合成後5.5291:1 | b1-button-contrast.json |

NodeのSQLite実験機能警告はテスト用アダプターから出る。本体はD1。候補起動時に静的サイト側のAstro tsconfigの依存未導入警告が出るが、静的HTTP配信・受付・通知処理の実動作を別途確認した。候補をソースから再ビルドする試験と、ビルド済み候補の起動試験は区別する。

## 実際の前後比較

- 保存障害／認証切れ：成功表示なし、入力本文21文字を保持。認証復旧後：201、受付番号表示、入力本文0文字。statusへフォーカス。
- 同じ受付の再送：初回201 → 再送200、同じ受付番号。候補DBの最終保存は1件。
- 長文：自動操作でmaxlengthを超えた5010文字を投入し、API400で拒否・本文保持。ネイティブの入力制限だけに依存しない。HTMLのmaxlengthは5000。手入力の5000文字打鍵を検証したという意味ではない。
- workerdの通知通信：redirect:errorでローカル通信失敗 → manualで3xxを明示拒否し、実HTTP200。外部ホストとリダイレクトは拒否。
- 通知障害：偽API503でretrying → 待機後の手動再試行でaccepted。候補DBの最終結果はaccepted／provider_accepted／1件。受信箱への到達は試験していない。
- 候補の実行：直接起動で.wrangler一時ファイルが追加され照合失敗 → 検証コピーから起動し、固定候補はvalid:true／changed:[]。

通常検証DBには接続診断で作成した2件が残る（acceptedとretrying）。削除や試行時刻の書換えはしていない。最終復元試験は別の.candidate-stateで1件だけを受け付け、上記の復旧結果を確認した。2つのDBの集計を混同しない。

## 最終候補

`releases/00f6e1e91e9070e82fe8ba44/manifest.json`。現在の参照はb1-release.json。公開承認は空で、local／noindex。旧候補は保存している。82a6200f19ce481d8bf6af25は直接起動の一時ファイル混入を検出した検証物で、現候補として扱わない。

## 独立レビューと残項目

読み取りレビュー1回。Important 3件をRED→GREENで修正：候補用集計DBの統一、clients親symlink拒否、通知の要確認理由。再レビューは依頼せず、追加回帰と全スイートで確認した。

MinorとしてrequestIdのUUID形式に非16進文字も通る点を残す。UIの生成はcrypto.randomUUIDで、保存一意制約は機能している。本番接続前に厳密化する。

物理スマートフォン、複数OS、実Turnstile、実メール到達・バウンス、Webhook、DNS／SSL／既存MX、アクセス制限、実アカウントの秘密実値・使用量、独立バックアップ復元、保持期限は未検証。B2／B3の対象。常駐監視や定期起動は設定していない。

終了時：検証タブ0件。4350／4351のサーバーを元セッションへのCtrl+Cで停止し、LISTENなしを確認。元デモは未接続、顧客向け編集・ログイン画面は追加していない。
