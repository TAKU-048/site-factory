# 採用資源台帳

2026-10-19。版を固定し、新規案件・採用版変更時に更新状況と条件を確認する。Star数は採用・安全性の保証にしない。

| 対象 | 採用版・場所 | 条件と使い方 |
|---|---|---|
| Astro | 7.4.0、site-template/package-lock.json | MIT。静的出力。lockfile固定。ユーザー承認後に取得 |
| @astrojs/check | 0.9.10 | MIT。開発時の型検証 |
| TypeScript | 6.0.3 | Apache-2.0。checkerの互換範囲に合わせ6系を選定 |
| @types/node | 24.19.2 | MIT。Node24用の型情報 |
| Impeccable | 0665bd812ae0908fcab17b96fd4f840defb882d9、vendor/impeccable/ | Apache-2.0。shape/typeset/layout/critique/audit/polishの必要箇所を参照。CLI・バイナリ・フック・検出器は未実行 |
| frontend-design／design-system | セッション提供の既存スキル | 制作時の方針に適用。顧客への配布物には含めない |
| space-study.svg | 自作、site-template/public/assets/ | 検証用オリジナル図版。実際の施工・写真ではない |
| 日本語書体 | OSのHiragino／Yu Gothic／Yu Mincho等 | CSSで指定。フォントファイルの取得・再配布はしていない。OS間の見え方は未比較 |
| 矢印SVG | 自作 | viewBox24、stroke1.5px、fill none。外部アイコンパッケージ未導入 |

段階Aの取得時のnpm出力は既知脆弱性0件。B1取得では監査を実行しておらず、この0件にB1の依存は含まない。取得済み依存の現在の全脆弱性・全実行経路を監査したという意味ではない。実行スクリプトはnpmのignore-scriptsで抑止。顧客納品にはTHIRD_PARTY_NOTICESとlockfileを含め、取得した依存のLICENSE／NOTICEを保持する。

候補比較と保留理由は「デザイン品質・外部リソース運用.md」。Lucide、Motion、AstroWind等の未採用コードは今回のデモへ導入していない。Impeccableの取得内容と起動コードの確認は「Impeccable導入確認.md」とvendor/impeccable-source-lock.json。

## B1ローカル基盤（2026-10-19）

- Wrangler 4.151.1：MIT OR Apache-2.0。[Cloudflare公式workers-sdk](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler)。Node>=22を確認。runtime/cloudflare/package-lock.jsonへ固定。
- Miniflare 5.20261012.1-beta：MIT。同じ公式workers-sdk。Wranglerの依存版に合わせてローカルD1・実HTTP試験に使用。ベータ版APIのため配布型定義のconvertV4MiniflareOptionsを使い版固定。
- workerd 1.20261012.1：Apache-2.0。[公式workerd](https://github.com/cloudflare/workerd)。ローカル実行バイナリ。
- esbuild 0.28.2：MIT。[公式esbuild](https://github.com/evanw/esbuild)。Wrangler依存。

ユーザー承認後にnpm --ignore-scriptsで39パッケージ取得。workerd/esbuildのinstall.jsを読み、フォールバック取得・削除コードを確認したため実行せず、取得済みoptional binaryを使用。全依存の監査を完了したという意味ではない。LICENSE／NOTICEはnode_modules内に保持。顧客の公開静的ファイルにこれらの開発依存を含めず、公開候補にはWorkerソースと依存lockを含める。

## 2026-10-21 追加：建設会社デモ用の写真

Unsplash License（商用利用可、クレジット任意、写真単体の再販売・類似サービスの構築は不可）。ユーザーが無料の商用利用可素材の使用を承認。撮影者・ID・用途の一覧は records/demo-construction-quality.md。実在の社員・施工事例として掲載しない。
