# SDD ledger — plan: docs/superpowers/plans/2026-10-19-cloudflare-b1.md

2026-10-19 ユーザーがB1実装とWrangler関連依存取得を承認。executing-plansとtest-driven-developmentを適用する。
Pre-flight: Task 1→2 ContactStoreとoutbox SQLを共有。Task 3→1 POST JSONと受付番号を共有。Task 4→3 ビルド成果物と公開／非公開設定の境界を共有。いずれも仕様と整合。
Ruling: Git初回コミット前・.git書込制約のため計画の専用フォルダとrecords台帳で進行する。スキルのGit前提ヘルパー・削除は実行せず成果を保持。費用はGitによる差分履歴が未作成である点。
Wrangler公式npm情報: 4.151.1、MIT OR Apache-2.0、Node>=22。postinstallなし。依存workerd/esbuildは取得後に実スクリプトを確認し、必要分のみ実行する。MiniflareはWrangler依存と同じ版を直接固定し、ローカルD1試験に使用する。
Task 1: complete — 受付・保存6件成功、実local D1の同時重複／batch途中失敗で全体ロールバックを確認。Miniflare 5の直接APIが旧READMEと異なるため、配布型定義のconvertV4MiniflareOptionsを使用。Node SQLiteの実験機能警告は試験用アダプターのみで、実WorkerはD1を使用。
Task 2: complete — 新規11件成功、既存23件成功。lease失効、送信後DB障害、同一キー再送、24h停止、恒久失敗、Retry-Afterを確認。
Ruling: workerd/esbuildのinstall.jsにはフォールバック取得・削除処理が含まれるため実行しない。取得済みoptional binaryを使ってMiniflare実試験に成功。追加スクリプトを許可する必要はない。
Ruling: Wranglerが既定のユーザー設定フォルダへログを書こうとしてsandboxで拒否された。以後WRANGLER_LOG_PATHとXDG_CONFIG_HOMEを案件内へ固定し、既存アカウント情報を読まない。費用は本番接続時に明示的な認証設定が必要になる点。
Task 3: 画面・配信の3件成功。実ブラウザで360/375/1280pxのはみ出し0・48px未満0。保存障害と認証切れで本文21文字保持、正常受付で本文消去・受付番号表示。状態欄へフォーカス。上限5000を超える5010文字の操作入力をAPIで拒否し本文保持。
Task 3: Ruling: 検証用サイトにはローカル専用の条件選択を表示する。本番顧客の画面には出さず、local-workerを別エントリーへ分離。費用は検証用UIを本番用接続で置き換える必要がある点。
Task 3: Ruling: 並列Astro buildがsymlink先のVite cacheを共有してENOTEMPTY。templateのcacheDirを各プロジェクトの.astro/viteへ分離し全27件成功。費用は顧客ごとの小さなキャッシュ増加。
Task 4: 候補の改変・追加ファイル・CSS/Worker/ビルド/秘密版変更・symlink・秘密混入を回帰試験。Workerソースと依存ロックも候補に含める。実パッケージでoutbox.tsをデータと誤判定したため、データ拡張子に絞る回帰試験を追加。
Final review: 独立した読み取りレビューを1回実施。Important 3件（候補用DB集計の取り違え、clients親symlink、通知理由不足）は回帰テストのRED→GREENで修正。再レビューは依頼せず、全スイートで検証する。
Final: fixed candidate summary — candidate/dev/summaryのconfig・persist先一致テストRED→GREEN。
Final: fixed parent symlink — 外部clients親リンクの拒否テストRED→GREEN。
Final: fixed notification reason — 固定理由コードをmigration 0002で保存し、期限切れ・上限・Retry-After超過の理由別集計をRED→GREEN。
Final: minor (deferred): requestIdの形式がUUIDの16進数限定でなく\wを許容する。現UIはcrypto.randomUUIDを生成し、重複防止はDB制約で機能する。厳密形式化は本番接続前の残項目。
Final: Ruling: 実Cloudflare/Turnstile/Resend、DNS/SSL/MX、秘密実値、アクセス制御、バックアップ・保持期限は承認範囲どおりB2/B3とする。未検証のまま本番稼働可とは報告しない。
追加の実地不具合：workerdはredirect:errorをサポートしないため偽メールへ接続できなかった。実workerd HTTP試験で502→期待200の失敗を再現後、manualで受けて3xxを拒否する方式へ修正。ローカル外ホストの拒否も同時検証。
Task 3: complete — 最終30件/Worker15件、engine/Worker型チェック成功。Astro check24ファイル0/0/0、7ページbuild成功。ブラウザ画面とボタン合成コントラスト5.5291:1を確認。
Task 4: complete — 固定候補00f6e1e91e9070e82fe8ba44から検証コピーを起動。初回201→重複200で同じ受付番号、別候補DBの通知が503のretrying→acceptedへ復旧、最終1件。固定候補valid:true/changed:[]。実地記録はcloudflare-b1-quality.md。
Task 4: Ruling: Wranglerが候補内へ.wrangler一時ファイルを書き込むことを実地確認。候補を.cache/candidate-runsへ検証付きコピーして起動し、原本を保持。費用は実行ごとの一時コピーが残りディスクを使う点。自動削除はしない。
Final verification: root30/30、runtime15/15、local実D1/HTTP2/2、engine/Worker型チェック、Astro check/build成功。MinorはUUID厳密形式1件。新しい機能変更後の試験完了。Gitコミット・本番公開・外部メール配送なし。
