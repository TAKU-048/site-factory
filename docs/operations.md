# 操作手順

2026-10-19。実装Aのローカル操作。コマンドはプロジェクト直下で実行する。新規パッケージ・画像・フォントの取得は事前承認対象。

## 1. 情報・素材とデザイン方針

`briefs/demo-company.json`を参考に企業情報、ページ・セクション、素材の許諾を整理する。業種IDはprofilesの登録名を使う。社名は日本語可、顧客IDは小文字英数字・ハイフン。入力にない実績・口コミ・資格を補わない。

ヒアリングでは希望デザイン、参考URLと好きな理由、フォント、配色、雰囲気、理念、こだわり、対象顧客、避けたい表現も受領し、個社のデザイン方針をMarkdownで保存する。現版のJSONは公開情報の最小構造であり、ヒアリングの全回答を格納する顧客CRMではない。

```sh
node --experimental-strip-types engine/cli.ts validate --brief briefs/demo-company.json --mode draft
node --experimental-strip-types engine/cli.ts propose --brief briefs/demo-company.json
```

proposeは業種の質問・注意点、利用可能な部品、3方向のデザイン設定、企業情報を対話AIへ渡す資料を出す。APIの自動課金・外部送信は行わない。Codex／Claudeがこの資料を基に方向性と原稿を作り、生成結果を別JSONへ保存する。提案形式は `directions: [{id,presetId,reason,pages}]`。

```sh
node --experimental-strip-types engine/cli.ts validate-proposal --brief briefs/demo-company.json --proposal briefs/個社提案.json
```

3案の構造を検証するが、掲載事実・権利の正しさやデザイン品質を自動保証しない。選んだ案のpagesを企業情報に反映し、内容を再確認してから生成する。

## 2. 手動選択と生成

```sh
node --experimental-strip-types engine/cli.ts create --client sample-company --brief briefs/個社情報.json --preset editorial
```

作成先は `clients/sample-company/`。存在する顧客IDは上書きしない。各サイト内の `src/data/site.json`、`src/custom/` が個社データ・専用部品。デザイン設定とセクション順も個社にコピーされ、元のpresetやtemplateを変更しても既存サイトは変わらない。

CLIは素材を `site-template/public/assets/` から取得する。ライブラリ関数createClientではassetRootを指定可能。素材のid、ファイル名、説明、許諾を入力に登録する。安全な相対パスだけを許可する。SVGの検査は危険構文の拒否であり、任意の第三者SVGを完全に無害化するサニタイザーではない。出所・許諾の確認を省略しない。

共通CSS・部品の改修は、対象顧客を明示し、変更前を履歴に保存して取り込む。現版に全社一括更新機能はない。

## 3. 個社の差分確認と更新

patchはJSON。許可フィールドは `company.name/tagline/description/email/phone/address/philosophy/website` と `pages`。例：

```json
{"company.tagline":"会社の実際の価値を伝える見出し。"}
```

```sh
node --experimental-strip-types engine/cli.ts report
node --experimental-strip-types engine/cli.ts plan-update --client sample-company --revision 現在のrevision --patch briefs/個社変更.json
node --experimental-strip-types engine/cli.ts update --client sample-company --revision 現在のrevision --patch briefs/個社変更.json
```

plan-updateは変更前後、対象ファイル、次revision、必要な再承認を返し、サイト内容・管理状態を変更しない。排他制御の履歴だけは保存される。updateは検証後に反映する。古いrevision、同時更新、symlinkは拒否する。構成の変更はpages配列で対象セクションIDと順序を維持して渡す。自然文を直接コマンドとして実行しない。

更新で掲載事実の確認と既存承認を解除する。 `.history/` に元データ・管理状態を保存する。現版のrevisionは公開JSONのハッシュであり、手動編集したCSS・Astroまでを含む公開承認の証明には使えない。本番承認には段階Bで成果物全体の指紋を結び付ける。Aでは公開状態へ遷移する機能自体を提供しない。

台帳のURL、ドメイン期限、公開日時、最終品質確認は、未連携の値をnullで表示する。問い合わせ本文やメール配信情報を台帳に集めない。

## 4. ビルドとローカル確認

```sh
npm ci --prefix clients/sample-company --ignore-scripts --cache .cache/npm
ASTRO_TELEMETRY_DISABLED=1 npm --prefix clients/sample-company run check
ASTRO_TELEMETRY_DISABLED=1 npm --prefix clients/sample-company run build
```

取得が必要な初回npm ciは承認済みの依存・保存先の範囲で実行する。再検証では `--offline` を付けて既存キャッシュを使える。署名や実行コード全体の安全性までnpm auditの結果で保証しない。

出力はその顧客内のdist。フォームは無効状態で、接続済みを装わない。デモ素材・実績なしを明示する。360px／375px、PC・中間幅、コントラスト、48px領域、キーボード、フォーカス、長文を実測し、記録する。検証ブラウザの使用は今回承認済み。新規案件でもユーザーのブラウザ制約を優先する。

## 5. 独立納品

```sh
node --experimental-strip-types engine/cli.ts export --client sample-company --destination sample-company-handoff-v1
```

exports配下の新しいフォルダへ、表示ソース、個社データ・素材、package/lockfile、設定、README、NOTICEをコピーする。必須ファイル不足・型不正・symlink・既存出力先では停止する。制作エンジン、他社情報、管理状態、履歴、秘密情報、node_modules、Gitは納品に含めない。削除せず新しい出力名を使う。

移転先でNode.js 22.22以上を準備し、納品フォルダのみで `npm ci` → `npm run check` → `npm run build` を行える。公開先ドメイン、フォーム、noindex解除、robots、SSL、実送信・復元テストは別途設定・確認する。ソース引き渡し条件は事業設計・契約に従う。

## 実装Aで残る制限

- 情報不足のJSONはエラーを返す。未完成のヒアリング回答を保存する専用UIはない。
- 承認の記録・解除用の型はあるが、顧客承認を収集する操作画面・公開処理はない。
- フォームの送信成功・失敗・再送は段階Bで接続後に検証する。
- CSS等を含めた成果物の署名、復旧自動化、監視、課金、営業管理は未実装。
- 保存中のプロセス停止に対する完全なトランザクション保証はない。履歴から手動回復できる状態を保持し、本番公開は行わない。
