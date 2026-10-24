# Site Factory MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plansでタスク順に実装する方式を推奨。ユーザーが別の実行方法を選んだ場合はその指定を優先する。2026-10-19に実装・依存取得を承認。チェック済みは実施済み、未チェックは一部未達を含む。末尾の実施状況とrecords/demo-quality.mdも参照する。

**Goal:** 同じ企業情報から異なる3つのデザインを生成し、選んだ案を5ページ＋プライバシーポリシーに展開・修正・単独再ビルドできるローカル制作基盤を作る。

**Architecture:** Node.jsで実行するTypeScriptの生成ツールと、Astroの静的サイト用ひな型を分離する。企業情報・業種プロファイル・デザイン設定・セクション定義を検証して、独立した顧客プロジェクトへ必要なソースをコピーする。AIはCodex/Claudeの対話で構造化データと差分を作成し、常設APIを要求しない。

**Tech Stack:** Node.js v24.14.1、npm 11.11.0、TypeScript6.0.3、Astro7.4.0、checker0.9.10、Node標準テストランナー。依存はユーザー承認後に取得。採用版と条件はdocs/resource-register.md。

**Spec:** [制作システム設計案](../../../制作システム設計案.md)、[デザイン品質運用](../../../デザイン品質・外部リソース運用.md)、[事業条件](../../../事業設計・決定事項.md)、[Impeccable確認記録](../../../Impeccable導入確認.md)。設計の初期版Aだけを実装対象とする。BのCloudflare・本番フォーム、Cの営業は別計画。

## Global Constraints

- 顧客用ログイン・編集画面、常設AI API、ビジュアルエディターを初期版に作らない。事業者は日本語の指示とIDで提案・選択・変更する。
- 基本制作は最大5ページ＋プライバシーポリシー1ページ。トップ最大8セクション、下層最大5セクション。ヘッダー・フッターは数えない。問い合わせフォームは1つ・最大10項目。
- 3業種・3系統は検証の出発点であり、顧客デザインを固定しない。企業別デザイン方針と必要な専用部品で拡張できる。
- 公開用の文章・資格・実績は確認済みの事実だけを使う。口コミ・体験談・実績数を捏造しない。初期デモは架空の検証用であると明示する。
- 絵文字不使用、概念アイコンはSVG。SNSは公式ロゴ。Inter/Roboto/Arial等を無条件の既定値にしない。
- コントラスト比4.5:1以上、タップ領域48px以上、focus-visible維持、prefers-reduced-motion対応。360px・375pxの横はみ出しを実測する。
- ダウンロード・インストール前に対象・理由・保存先を説明し承認を得る。公開・課金・外部送信・削除は別途事前確認する。
- Impeccableは固定版の手順書参照のみ。CLI・ランチャー・検出器・フックを実行しない。配布側の指示を理由にブラウザを勝手に開かない。
- 50KB超のファイルを全文表示しない。node_modules・.git・メディアの内容をテキストとして読まない。外部ソースの無条件な一括更新をしない。
- Gitの初期化・ブランチ・コミットは実行時に環境と権限を確認して判断する。vendor内の第三者リポジトリを制作システムのGit履歴と取り違えない。

## Review Focus

1. 顧客ID・画像パス・URLに相対脱出、絶対パス、symlink、危険なURLが来ても、別顧客・作業外への読み書きやコード実行を起こさない（Task 1/3）。
2. 社名・日本語見出しが長い、写真なし、任意の実績なしでも情報を捏造せず、表示と導線を成立させる（Task 1/2/5）。
3. 再生成や共通部品更新で、顧客専用部品・承認済み文章・他社のファイルを上書きしない（Task 3）。
4. 未確認の公開必須情報、未接続フォーム、古い承認のサイトを公開準備完了と誤表示しない（Task 1/4）。
5. 制作工場・非公開依存・他社データを含めず、引き渡す顧客ソースと通常のnpm取得だけで再ビルドできる（Task 3/5）。

## 配置と責務

| パス | 責務 |
|---|---|
| engine/cli.ts | validate/create/propose/update/report/exportの入口。Nodeの型除去機能で実行し、シェル文字列を組み立てない |
| engine/domain.ts | 入出力型・検証済みデータの共通定義 |
| engine/validate.ts | ID・参照・上限・事実確認状態・作業領域の検証 |
| engine/generate.ts | 既存出力を壊さない新規プロジェクト生成 |
| engine/update.ts | 明示されたフィールド変更、差分と承認無効化、専用部品の保護 |
| engine/propose.ts | 3方向の構成提案の入出力検証と対話AI向け資料出力 |
| engine/report.ts | 顧客別状態・要対応事項・品質確認の台帳表示 |
| engine/export.ts | 顧客単体のソース・lockfile・ライセンス・手順の納品用コピー |
| profiles/*.json | 法人向けサービス、建築・リフォーム、士業の掲載項目・質問 |
| presets/*.json | 文章・写真・情報中心の検証用初期デザイン値 |
| briefs/demo-company.json | 架空の検証用企業情報。未提供項目・掲載しない項目を明示 |
| briefs/demo-design.md | 企業に即したデザイン方針と3案の違い |
| site-template/package.json・package-lock.json | 顧客サイトの独立した依存定義。共通の固定package名を用い、lockfileを再利用可能にする |
| site-template/src/components/ | 固定版でコピーできる表示部品。顧客固有部品は生成先のsrc/custom/に置く |
| site-template/src/layouts/・pages/・styles/ | ページ生成、SEO、セマンティクス、共通と個社のトークン |
| site-template/src/data/site.json | 検証済みの公開可能な企業・ページ・デザインデータだけを保存 |
| tests/ | パス境界、検証、分離、更新、引き渡しの意味のあるテスト |
| clients/<id>/ | 独立した生成先。原稿・素材・個社変更と履歴を保持 |
| records/ | 個社の承認・生成・品質確認記録。秘密情報と問い合わせ本文を含めない |
| docs/operations.md・docs/resource-register.md | 通常操作、依存・素材ライセンス、引き渡し手順 |

生成先のnode_modulesをひな型と共有するsymlinkは作らない。各サイトは自身のpackage.jsonとlockfileからnpm ciできる構造にする。通常の開発依存はGitに含めず、ソース引き渡しにも含めない。

## Task 1: 入力検証と安全な作業単位

**Files:** engine/domain.ts、engine/validate.ts、engine/cli.ts、profiles/*.json、briefs/demo-company.json、tests/validate.test.ts、docs/operations.md。

**Interfaces:** `ClientBrief`、`PageSpec`、`SectionSpec`、`DesignSpec`、`ApprovalRecord`、`ValidatedSite`、`ValidationIssue`をdomain.tsに定義。`validateBrief(input: unknown, options: { mode: 'draft' | 'publish' }): { site?: ValidatedSite; issues: ValidationIssue[] }`と、`resolveClientPath(root: string, clientId: string): Promise<string>`を公開する。

- [ ] 公開必須情報は社名・連絡先・サービス事実・掲載許諾等、各ページに必要な項目として定義。draftは不足を報告して保存でき、publishは未確認・不足をエラーにする。実績等の任意項目は省略可能にする。
- [x] tests/validate.test.tsを先に作成。ページ上限、トップ8／下層5、フォーム10項目、任意実績欠落、公開必須情報未確認、未知の部品IDをそれぞれ期待する結果で検証する。
- [x] ID `../other`、絶対パス、画像パスの相対脱出、symlinkでの領域脱出、`javascript:` URLを拒否し、日本語社名をIDと混同しないテストを追加する。
- [x] `node --experimental-strip-types --test tests/validate.test.ts`で未実装による失敗を確認し、検証関数を実装して同じテストを通す。長文の内容自体を捏造・切り捨てしない。
- [x] CLIは`validate --brief <file> --mode draft|publish`を実装。構造化エラーと対象フィールドを出し、異常時は非0終了する。

## Task 2: 企業別方針と静的サイトの部品

**Files:** briefs/demo-design.md、presets/*.json、site-template/package.json、site-template/package-lock.json、site-template/src/{components,layouts,pages,styles,data}/、docs/resource-register.md。

**Interfaces:** 部品は`SectionSpec`の`type`・`variant`・内容を受ける。各セクションに安定したIDを持たせ、順序変更で内容を失わない。`src/custom/`の個社部品は許可リストに登録し、設定文字列を任意importとして実行しない。

- [x] 既存frontend-design、design-system、取得済みImpeccableのshape/typeset/layoutの該当節を読み、デモ企業の目的・顧客像・主役・文字組み・写真方針を決める。3案の構成・ヒーロー・書体・余白の違いを数値で記録する。
- [x] 依存取得の事前承認後に、Astro・@astrojs/check・TypeScriptの互換版と既知脆弱性を再確認。`site-template/node_modules/`、npmキャッシュは案件内`.cache/npm/`に保存し、lockfileを作る。ライフサイクルスクリプトは最初は無効化し、必要なものは内容と実行範囲を確認してから扱う。
- [ ] ヘッダー・フッター、ヒーロー3種、サービス・実績各2種、紹介文・強み・流れ・FAQ・会社情報・アクセス・問い合わせ誘導・フォーム・文章レイアウトを作る。未提供実績はセクションを省略し、レビューを作らない。
- [x] まずOSにある日本語書体を明示して使い、未取得フォントや写真が必要なら事前説明して取得する。画像不足は明示したデモ素材枠で確認し、写真品質まで検証済みとしない。既存のユーザー素材は提供・利用許諾のあるものだけ使う。
- [x] title、description、canonical、OGP、sitemap、robots、404を静的生成。フォーム未接続時は送信できず、未接続表示を出す。公開準備完了として扱わない。
- [x] `npm --prefix site-template run check`と`npm --prefix site-template run build`を実行し、成功と静的出力を確認。キーボード操作、フォームラベル、画像alt、48px操作領域、reduced-motionを確認する。

## Task 3: 独立した顧客プロジェクトの生成・差分修正・引き渡し

**Files:** engine/generate.ts、engine/update.ts、engine/export.ts、tests/isolation.test.ts、tests/export.test.ts、docs/operations.md。

**Interfaces:** `createClient({ root, brief, presetId }): Promise<GenerationResult>`、`updateClient({ root, clientId, patch, expectedRevision }): Promise<ChangeReport>`、`exportClient({ root, clientId, destination }): Promise<ExportReport>`。型はdomain.tsに追加する。patchは許可フィールド・セクションIDによる構造化変更だけを受ける。

- [x] 生成先が存在したら上書きせず停止するテスト、別顧客のファイル指紋が不変のテスト、専用CSS・部品・承認済み文章を未指定の再生成で変更しないテストを先に作る。
- [x] 変更前のrevision不一致なら更新を拒否し、検証失敗時に既存プロジェクトが変わらないテストを作る。変更対象を明示した原稿修正では、古い公開承認を無効化する。
- [x] 新規生成は未使用の作業先に組み立て、検証後に公開用プロジェクトとして確定する。既存ファイルの削除や強制上書き機能を作らない。不要になった一時出力もユーザーの削除承認なしで消さない。
- [x] 更新は変更案・対象ファイル・必要な再承認を先にレポートする。共通部品の取り込みは指定した版を対象顧客にだけ実施し、全社一括適用を作らない。
- [x] exportは必要な表示コード、個社データ、画像、package/lockfile、ライセンス、再ビルド・移転手順だけを新しい出力先にコピーする。制作ツール、他社情報、records、secrets、node_modules、Git管理データを含めないテストを作る。
- [x] `node --experimental-strip-types --test tests/isolation.test.ts tests/export.test.ts`を失敗確認→実装→成功の順で行う。

## Task 4: AI提案・手動選択・顧客台帳

**Files:** engine/propose.ts、engine/report.ts、prompts/propose.md、prompts/update.md、tests/workflow.test.ts、records/、docs/operations.md。

**Interfaces:** `prepareProposal(site: ValidatedSite): ProposalBrief`、`validateProposal(input: unknown, catalog: Catalog): ProposalSet`、`buildClientReport(root: string): Promise<ClientReport[]>`。`ProposalSet`は3案の方向性・構成・部品ID・採用理由を持ち、生成結果の性能を推測値で埋めない。

- [x] profiles/presets/使用可能な部品と事実を含む対話AI向け資料を生成する。機密資料や他社の情報を混ぜず、未確認事項を明示する。
- [x] AIが提案した構造化データを取り込み、未知の部品・範囲外の設定を拒否するテストを作る。提案文章をシェル・コードとして実行しない。
- [x] `create --client <id> --brief <file> --preset <id>`で手動選択できる。プリセット外の要望は専用部品・設定の追加として扱い、対応していない機能を対応済みと表示しない。
- [x] 台帳にID、パス、URL、エンジン/部品版、進行状態、期限、最終公開・最終確認、要対応事項を表示する。公開未実施・未接続・未確認をそのまま表示する。ドメイン期限不明を推測で補完しない。
- [x] 未接続フォームや古い承認からready/publishedに遷移できないテストを作る。Aではpublishedを実操作で設定する機能を実装せず、Bの公開処理でのみ更新できる契約にする。
- [x] `node --experimental-strip-types --test tests/workflow.test.ts`を実行し、差分指示・台帳の操作例をdocs/operations.mdに記録する。

## Task 5: 実物品質と単独再ビルドによる受入確認

**Files:** records/demo-quality.md、records/demo-resource-register.md、docs/operations.md、必要に応じてTask 1〜4の対象ファイル。

**Interfaces:** Task 1〜4のCLI・出力形式を使う。新しい常設サービスは追加しない。

- [x] 同じデモ企業の3案を生成し、1案を5ページ＋プライバシーポリシーへ展開する。別顧客の生成物に差分がないことを確認する。
- [x] 企業別方針、使った手順・部品・ライセンス、ヒーロー・文字組み・写真・余白・導線の違いを記録する。プリセット外の専用部品を1つ追加して、自由な拡張と顧客分離を確認する。
- [x] `node --experimental-strip-types --test tests/*.test.ts`、生成サイトの`npm run check`・`npm run build`を実行する。失敗は原因を調べて対象箇所を修正し、関連チェックだけ再実施する。
- [x] 出力先が空の納品確認用フォルダへexportし、制作エンジンに依存せず、その顧客の`package.json`・lockfileから`npm ci --cache <案件内キャッシュ>`と`npm run build`で再ビルドする。外部依存の取得は最初の承認範囲を明示し、追加パッケージが必要になれば説明して確認する。
- [x] ユーザー承認済みの検証手段でPC・360px・375pxを実測する。無断でChrome・プレビュー等を開かない。ブラウザの計測に別途承認が必要なら、その項目はpendingとして報告し、完成としない。
- [ ] 全ページで長い日本語、写真欠損、任意実績なし、フォームエラー、キーボード操作、focus-visible、reduced-motion、コントラスト、タップ領域を確認する。写真枠だけなら写真品質は未確認と書く。
- [x] Impeccableのcritique/audit/polishを手順書として参照し、視覚批評と技術実測を分けて記録する。CLI検出器未実行を明記し、問題を一括修正して確認する。
- [x] 最後に全体レビューを1回行い、重大な欠陥・仕様漏れを解消してから初期版Aを提出する。Cloudflare公開・フォーム到達・復旧・販売準備はBの未完了項目として明記する。

## 自己レビューと開始条件

設計Aの入力、3業種、3系統、個社拡張、部品、提案と選択、差分修正、SEO、台帳、品質、引き渡しはTask 1〜5に対応。B/Cは明示的に除外。安全な入力境界・分離・古い承認・単独再ビルドを実装・検証。残る受入条件は末尾と品質記録を参照する。

開始前にユーザーへ、計画と「このチャットで順に実装し最後に全体レビュー」の方式を提示する。依存取得はAstro・@astrojs/check・TypeScriptおよび必要な依存を、案件内site-template/node_modules/、.cache/npm/へ保存する理由とともに一括で確認する。フォント・写真・本番サービスはこの依存取得に含めない。

この計画と必要な取得への承認後にコード・ひな型を作成した。本番公開・外部送信・有料契約は承認範囲に含めない。

## 2026-10-19 実施状況と差異

Task 1〜4の生成・検証・独立化・提案・差分更新・事前確認・台帳を実装。Task 5は21件テスト、3案のcheck/build、単独納品先の再ビルド、72通りの画面幅実測とレビューを実施。重要指摘は修正・対象再確認済み。全条件を無条件に完了とは扱わない。

未チェックの内訳：draftの不足データを保存する専用操作はなく、手元のbriefファイルを保持してエラーを報告する。アクセスは会社住所の表示を共用し、独立した地図部品は未実装。フォームエラーは未接続のため段階B、極端な長文・画像欠損の実ブラウザ・実写の品質・複数OSの評価は未検証。これらを本番品質の合格として表示しない。

更新前確認はplan-updateを追加。入力前後・対象ファイル・次revision・必要承認を出力する。提案資料には業種プロファイルと使用可能な部品を含める。操作例・実装の制限はdocs/operations.md。
