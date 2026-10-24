# SDD ledger — plan: docs/superpowers/plans/2026-10-19-site-factory-mvp.md

2026-10-19：ユーザーが実装計画・依存取得・初期版実装を承認。このチャットで順に実装する。

Ruling: 初回コミット前でworktreeの分岐元がなく、既存コードもないため、専用フォルダ内のcodex/site-factory-mvpブランチで実装する。別案件を変更しない。差分の追跡はファイルと進捗記録を使い、不要な一時ファイル削除をしない。

Pre-flight: Task 1のdomain/validationをTask 2〜4で共用。顧客IDと会社の表示名を分離する。公開データと管理履歴を分離し、Task 3の引き渡しにrecordsを含めない。Task 4はTask 3のrevisionを使い、古い承認を無効化する。

Ruling: 既存の検証環境を使い、依存取得のキャッシュは案件内.cache/npmに固定。ダウンロード済みImpeccableは手順書のみ参照し、コマンド・フックは起動しない。

Task 1〜4: ローカル機能を実装。Task 5: 下記の実測を実施。残る受入条件は計画末尾とdemo-quality.md。

2026-10-19 実施記録：
- Node24.14.1/npm11.11.0。Astro7.4.0、checker0.9.10、TypeScript6.0.3、types/node24.19.2を承認後にignore-scriptsで取得。
- 21件テスト成功、engine型チェック成功。3案でAstro checkのエラー・警告・ヒント0、各7ページbuild成功。
- SVG大文字拡張子、固定リンク、台帳symlink、納品不足、既定文章混入を回帰テストでRED→GREEN。提案資料と事前差分機能も修正し、レビュー再確認済み。
- 3案×6ページ×4幅=72通りの実ブラウザ測定。横はみ出し0、48px未満0、透明度を含む通常文字の最小コントラスト7.4806:1。初回の透明度を含まない計測値は不十分と判明し訂正。
- export先でoffline npm ci、check、buildを実行。納品に制作エンジン・全社管理・秘密・依存フォルダを含めない。
- ブラウザ検証はユーザーが明示承認。Quick Lookの権限昇格は自動承認レビュー利用上限で処理されず、別途承認されたブラウザで検証。初回コードレビューも上限で中断後、再開して対象修正を再確認。
- 削除・課金・外部営業送信・本番公開・Gitコミットなし。既存の試作・納品v1/v2は残す。

Ruling: 現版revisionは公開JSONのみ。CSS/Astroを含めた成果物の公開承認・公開状態への遷移は段階Bで実装する。Aの台帳は公開済みを装わない。

Ruling: Impeccableは参照文書のみ。正式コマンドの評価や検出器実行済みとは報告しない。

最終確認：21件テスト・engine型チェックを再実行して成功。最終CSSを含むhandoff-v3でもcheck（10ファイル、エラー・警告・ヒント0）と7ページbuildに成功。検証用ブラウザのviewportを解除し、作成タブを閉じた。サーバーは通常sandboxのkillが拒否されたため、元の実行セッションへCtrl+Cを送り終了。4337〜4339番にLISTENがないことをlsofで確認。

2026-10-19 追加検証：長い英字社名で360px画面が909pxへ広がる問題を修正。3案×6ページ×4幅の72条件で横はみ出し0・48px未満0。画像404は3幅で本文・代替テキストが残ることを確認。テンプレートの未登録画像混入もRED→GREENで修正し、登録済み素材のコピーを確認。最新23件テスト成功、engine型チェック成功。記録はrecords/edge-case-quality.md。handoff-v3は追加修正前として保存。QAサーバー4340〜4342停止、検証タブ0件を確認。段階Bは計画作成中で、実装・新規依存取得・外部接続は未承認。

2026-10-19 B1計画完成：docs/cloudflare-b1-design.mdとdocs/superpowers/plans/2026-10-19-cloudflare-b1.mdを作成し自己点検。受付・D1保存、通知再試行、フォーム、公開候補の4タスク。Wrangler等の新規取得とローカル実装の承認待ち。本番接続・課金・DNS・外部メール・Cron・自動削除はこの承認に含めない。

2026-10-19 B1実装完了：records/cloudflare-b1-quality.md、records/cloudflare-b1-progress.mdを参照。受付・保存・通知再試行・フォーム・固定候補をローカル実装。root30件、runtime15件、実D1/HTTP2件成功。候補DB1件の受付・重複抑止・偽メール通知復旧と候補不変を実地確認。実接続はB2、独立バックアップ等はB3。UUID厳密形式のMinor1件は本番前に対応。検証サーバー・タブ終了。

2026-10-19 Cloudflare MCP：ユーザー指示により案件専用.codex/config.tomlと.mcp.jsonへ公式https://mcp.cloudflare.com/mcpを登録。Codex CLIでenabled:true、ClaudeでProject config/Pending approvalを実確認。認証なしinitializeは実HTTP401＋OAuth challenge。OAuthと実アカウントの読み取りは未実施。追加パッケージ取得・グローバル設定変更・ブラウザ起動・本番変更なし。共通運用をdocs/cloudflare-mcp-operations.mdとAGENTS.md／CLAUDE.mdへ記録。次は本人のブラウザ認証と案件MCP承認。

2026-10-19 Cloudflare OAuth開始：ユーザーがブラウザ起動を承認。既定loginは全サービスに広いscopeを要求したため、承認前に中断。offline_access,user:read,account:read,workers-scripts.read,workers-scripts.write,d1.read,d1.writeへ絞って再開し、認証画面の起動を依頼。本人のログイン・対象アカウント・権限承認待ち。認証用URL/state/code_verifierは記録しない。認証後に実アカウントの参照だけを検証する。

2026-10-19 Codex OAuth成功：ユーザーの認証完了連絡後、待機プロセスでSuccessfully logged inを確認。現在チャットにはCloudflare MCPツールがまだ露出していないため、実アカウントの参照は未確認。Claudeは.mcp.jsonのoauth.scopesを同じWorkers/D1範囲に固定し、連携指示に基づき案件ローカル設定でcloudflare-apiのみ有効化。Claudeの認証を開始する。全MCPの包括承認・グローバル設定変更なし。

2026-10-19 Cloudflare MCP両方のOAuth完了：本人の完了連絡後、Claude CLIのAuthenticated with cloudflare-apiを確認。直後のgetでConnectedを実確認。Codexも先のログイン成功と案件設定enabled:trueを確認済み。Workers/D1の参照・編集に限定したscopeで認証。現在チャットのツール一覧にはCloudflare未露出のため、設定再読み込み後にアカウントとリソースのメタデータを参照する。Worker・D1の作成変更・本番公開・DNS・課金・外部メール送信なし。

2026-10-19 MCP参照再開の制限を実確認：公式app-serverのinventoryではcloudflare-api/authStatus:oAuth、docs/search/execute/whoamiあり。一方、現在チャットにツールは未露出。既存アプリのcontrol socketなし、別app-serverの同一thread再接続はactive writer競合で拒否。競合回避のため複製・新規チャット作成・書込ロック回避はしない。Codex自身のComputer Useは安全制限で禁止された。ユーザー側のCodex再起動が必要なためrecords/cloudflare-next-step.mdへ再開点を保存。Cloudflare APIのアカウント／リソース参照・作成変更はまだ未実行。

2026-10-19 MCP実参照完了：再開後に公式Cloudflare MCPがチャットへ露出。GET /accounts HTTP200・1アカウント、Workers一覧HTTP200・0件、D1一覧HTTP200・0件。workers.dev未設定10007、Workers設定HTTP200/default_usage_model standard、契約一覧は10000認証エラーで未確認。資産作成・更新なし。records/cloudflare/connection-check.json、docs/cloudflare-b2-environment-proposal.mdへ記録。今後は再認証・再起動を繰り返さず、検証環境の作成承認へ進む。

2026-10-21 Claude引き継ぎ：ユーザーがCodexの作業停止を確認し、Claudeが引き継ぎ。今回のゴールは「B2検証環境の作成前の確認・計画まで」（ユーザー回答）。Cloudflare上の作成・変更・公開・課金は今回の範囲外。このClaudeセッションにはcloudflare-api MCPツールが露出しておらず、契約状態はAPIで再確認していない（現scopeに課金参照権限もない）。契約は本人の請求画面での確認を依頼。Workers & Pages画面を開くとworkers.devが自動生成される場合があるため、そちらは開かないよう依頼。
2026-10-21 契約確認：ユーザーが請求画面で確認し、Workersは「Free」と回答（本人申告。API未照合）。B2検証はWorkers Free／D1 Freeの範囲で計画する。有料契約は行わない。
2026-10-21 B2作成前の決定：workers.devサブドメインsite-factory、Worker site-factory-staging、D1 site-factory-staging-contact、アクセス制限して公開（ユーザー回答）。docs/cloudflare-b2-environment-proposal.md末尾に記録。Cloudflare上の作成・変更なし。今回のゴール（作成前の確認・計画まで）到達。
2026-10-21 Access調査：workers.dev/Preview URLはAccessで保護可能、Zero Trust Freeは50ユーザー$0。支払方法登録要否は未確認。現scopeでAccess設定不可。サブドメイン空き確認はこのセッションでMCP未露出のため未実施。詳細はdocs/cloudflare-b2-environment-proposal.md末尾。作成・変更なし。
2026-10-21 Cloudflare Developer Platformコネクタ（claude.ai、ユーザー指示で接続）：workers_list 0件、d1_databases_list 0件（読み取りのみ）。このサーバーは自ら非推奨（DEPRECATED）と表示し公式https://mcp.cloudflare.com/mcpを推奨。露出ツールはWorkers参照、D1/KV/R2/Hyperdriveの作成・削除・参照、ドキュメント検索のみ。workers.devサブドメイン・Worker公開・Access設定のツールなし。アカウント一覧ツールも露出せず対象アカウントIDは未照合。作成・変更なし。
2026-10-21 最終ゴール照合：ユーザー提示の最終ゴール指示を既存設計・実装と照合し、最終ゴール照合・設計案.mdを作成。実装・コード変更・外部接続なし。既存決定事項は変更していない。
2026-10-21 決定：営業用デモは認証なしで公開（ユーザー指示）。検証環境のアクセス制限は維持。公開先・名称・noindexは未決定。ファイル記録のみ、Cloudflare変更なし。
2026-10-21 tk-creative.org移転：workers.devサブドメインtk-sitesを登録（site-factoryは取得不可）。Worker tk-creative-site をデプロイし、https://tk-creative-site.tk-sites.workers.dev で全24ファイルが200・サイズ一致、/ はindex.html、未存在は404を確認。tk-creative.orgのDNSは未切替（さくらのまま）。
2026-10-21 tk-creative.org本番切替：ユーザー承認後、ユーザーがDNSのA(49.212.207.49)2件を削除し、Worker tk-creative-site に tk-creative.org／www.tk-creative.org をCustom Domainとして接続。配信元cloudflare・全ページ200を確認。MX・TXT（Email Routing）は変更なし。続けて web-subscription.html追加・pricing.html差替・preview.html 02行のリンク化をsite/へ反映（元ファイルは~/tk-creative/backup-2026-10-21-sakura/）。デプロイ待ち。
2026-10-21 tk-creative.org反映完了：web-subscription.html公開、preview.htmlの02行をリンク化、pricing.html差替（LP/Website価格削除・月額行追加・FAQ修正2回/クレカ自動決済のみ・依頼の流れの支払い文・コントラストと48px修正）。本番のpricing.htmlがローカルとSHA-256一致を確認。
2026-10-21 建設会社向け営業デモ2種を制作：demo-build-recruit（採用重視、preset recruit-bold）、demo-build-works（施工例重視、preset craft-quiet）。写真はユーザー承認によりUnsplash License素材を使用（images.unsplash.comの接続をユーザーが許可）。48条件の実測ではみ出し・48px未満・画像欠損0。記録 records/demo-construction-quality.md、公開設定 deploy/demos/。公開（workers.dev、認証なし）はユーザーのWrangler実行待ち。
2026-10-21 デモ作り直し・追加：建設2種を動き・背景で作り込み（ユーザー指摘対応）。飲食店（demo-food-ramen）と美容室（demo-beauty-salon）のデモを追加し、profiles/restaurant・beauty、presets/noren-night・mirror-softを追加。40条件の実測で問題0。記録 records/demo-construction-quality.md 追記。公開はユーザーのWrangler実行待ち。
2026-10-21 他業種デモ追加（ユーザー指摘：飲食店・美容院は専用プラットフォームがありホームページの重要度が低い）：運送・物流（demo-logistics、preset night-route）と介護・福祉（demo-care-day、preset komorebi）を制作。profiles/logistics・care追加。48条件の実測ではみ出し・48px未満・画像欠損・JSエラー0、astro check エラー0。飲食店・美容室のデモは削除せず残置（デモ一覧に載せるかは未決定）。記録 records/demo-construction-quality.md 追記③。公開設定 deploy/demos/demo-logistics・demo-care-day。公開はユーザーのWrangler実行待ち。
2026-10-21 デモ6種の公開をユーザーが実行（workers.dev、認証なし）。robots.txtの応答で公開を確認（ページ本文は検索除外設定のため取得ツールでは未確認）。続けて最終ゴール「会社サイトで業種別に絞り込めるデモ一覧」を作成：tk-creative.org の web-subscription.html に制作例（Samples）セクションを追加（建設・運送・物流・介護・福祉・飲食・美容の絞り込み、各デモへのリンク、架空である旨の注記）、見本画像を images/demos/ に追加。Macの ~/tk-creative/site/ へ反映済み、本番反映はユーザーのWrangler実行待ち。
2026-10-21 申し込みの流れを決定（ユーザー回答）：ヒアリングはWebシートのみ、申込はWeb申込フォーム＋利用規約同意、素材はGoogleドライブ共有フォルダ。事業設計・決定事項.md に記録。実装・外部サービス契約なし。
2026-10-21 申し込みの流れの部品を作成（tk-creative.org、本番未反映）：contact.htmlに「月額ホームページ制作」を追加（service=web-subscriptionで自動選択・予算欄を非表示。元ファイルは~/tk-creative/backup-2026-10-21-flow/）、web-hearing.html（ヒアリングシート、noindex）、web-apply.html（申込フォーム＋規約同意、noindex）、web-terms.html（利用規約）、tokushoho.html（特定商取引法に基づく表記）、web-subscription.htmlのフッターに規約・特商法のリンク。送信先は既存Formspree（件名で区別）。4幅ではみ出し0、送信テストは通信を模擬して確認（実送信なし）。利用規約・特商法に「要決定」箇所あり（事業者名・責任者・住所・電話、決済失敗時の停止期間、公開前キャンセルの段階と金額、著作権の帰属、賠償上限、管轄裁判所、制定日）。Stripe手順を docs/stripe-setup.md に作成（アカウント未作成）。
2026-10-21 利用規約の決定（ユーザー回答）：決済失敗から14日で公開を一時停止可・支払確認で再開／著作権は同業の一般的な扱いに合わせ当方に帰属・契約中は利用可・引き渡し後は無償で無期限に利用・改変可（共通の仕組み・他社ライセンス素材は除く）／賠償はお客様が損害の根拠資料を提出した範囲／管轄は静岡地方裁判所。web-terms.html に反映（本番未反映）。残る要決定：公開前キャンセルの段階と金額、制定日、特商法の事業者情報。
2026-10-21 賠償の扱いを変更（ユーザー指示）：損害の賠償は行わず、申込時に同意を得る。web-terms.html 第13条第3項と web-apply.html の同意文に反映（本番未反映）。
2026-10-21 賠償の扱いを再変更（ユーザー指示）：賠償額は月額料金1か月分（10,560円税込）を上限、申込時に同意。web-terms.html 第13条第3項・web-apply.html 同意文に反映（本番未反映）。
2026-10-21 競合に合わせて決定（ユーザー委任）：公開前キャンセルは着手前無料、着手後〜トップデザイン提示前33,000円税込、提示後〜公開55,000円税込（固定の解約手数料3万〜5万円程度が多いとの解説記事を参考）。規約制定日2026年10月21日。特商法は所在地・電話を『請求があれば遅滞なく開示』、連絡はメール（同業のデザインクリップは電話番号なしで記載）。残る要決定：代表者の氏名。web-terms.html・tokushoho.html に反映（本番未反映）。
2026-10-21 特商法の代表者氏名を記入（ユーザー回答）。利用規約・特商法の要決定はすべて解消（本番未反映）。
2026-10-21 tk-creative.org本番反映をユーザーが実行。本番で確認：特商法（販売事業者・運営責任者記入、要決定なし）、利用規約（キャンセル料・賠償上限・制定日、要決定なし）、問い合わせフォーム（選択肢6つ・撮影の対応エリア）。次はStripeアカウント登録（ユーザー作業、docs/stripe-setup.md）。
2026-10-21 Stripeアカウント（TK-creative）の登録・申請をユーザーが完了と報告（Radar Lite、Stripe Tax・Climateはオフ、明細書表記 TK-CREATIVE 等）。ONEPOSTは別アカウントにする方針を案内（未作成）。商品登録・顧客ポータル設定の完了は未確認。
2026-10-21 Stripeカスタマーポータル設定済み（ユーザー報告）。ログインリンクを docs/stripe-setup.md に記録。承諾とカード登録の案内メール文面を docs/email-acceptance-card.md に作成。
2026-10-22 Stripe商品登録完了（ユーザー報告）：月額ホームページ制作・管理（10,560円税込・毎月）、ページの追加（22,000円税込・1回）。カード登録の段階まで準備完了。
2026-10-22 Googleドライブに親フォルダ「ティーケークリエイティブ月額ホームページ お客様素材」を作成（ユーザー承認、共有なし・上位の権限を継承しない設定、ID 17vC6xWSH8qlKH8SAcxvTa1_769S0I526）。素材提出のご案内メール文面と、お客様別フォルダの作り方を docs/email-materials.md に作成。
2026-10-22 決定：確認用プレビューはCloudflare Accessのメール認証で制限／フォーム配送サービスの契約は最初の契約決定後（ユーザー回答）。事業設計・決定事項.md に記録。
2026-10-22 プレビューの方式をメール認証（Cloudflare Access）で確定（ユーザー判断、安全性の比較を説明のうえ）。Zero Trust Free の有効化へ。超過時のカード請求の許可が条件のため、公開後のユーザー削除を運用手順に追加（docs/preview-access.md）。
2026-10-22 確認用プレビューのメール認証が動作（ユーザー確認）：preview-test をCloudflare Accessで保護、One-time PINのメールで閲覧できた。手順と注意を docs/preview-access.md に記録。許可外アドレスで開けないことは未確認。
2026-10-22 許可外アドレス（contact@tk-creative.org）にPINが届かないことを確認（ユーザー確認）。確認用プレビューのメール認証の検証完了。
2026-10-22 台帳をGoogleスプレッドシートで作成（ユーザー決定）。見込み客・顧客・やり取りの履歴・使い方の4シート、状態は選択式。共有なし。

## 2026-10-22 営業先の発掘（建設・1回目）
- 地域：東京都＋神奈川・埼玉・千葉。Googleマップで候補48件 → チェーン・ショールームを除き30社を公式サイトで確認・採点。
- 台帳の「見込み客」に30行を記入（L001〜L030）。メール送信・フォーム送信はしていない。
- 連絡できる上位：一誠工務店90／山本工務店80／宇井工務店72／ジョン石橋ビルダーズ67／鈴木工務店64。
- ホームページが見つからない5社は連絡手段がないため保留。営業お断りの表示がある2社（堀越住建・千葉工務店）は対象外。
- 台帳ファイルは作り直したため新しいID：1ne-B0ij7yAPgss60C8ZnQE9heNfckxs12ipkCTm7qsk（古いファイルはゴミ箱）。
