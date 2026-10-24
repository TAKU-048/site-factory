# AIホームページ制作サービス：制作システム初期版

2026-10-19。ローカルで顧客サイトを生成・修正・単独納品するための試作。Node.js 24.14.1で検証。

- [操作手順](docs/operations.md)
- [採用資源とライセンス](docs/resource-register.md)
- [デモの実測・未検証項目](records/demo-quality.md)
- [長文・画像不足の追加検証](records/edge-case-quality.md)
- [Cloudflare B1の設計](docs/cloudflare-b1-design.md)
- [Cloudflare B1の実装計画](docs/superpowers/plans/2026-10-19-cloudflare-b1.md)
- [B1ローカル基盤の操作手順](docs/cloudflare-local-operations.md)
- [Cloudflare MCP：Codex・Claude共通運用](docs/cloudflare-mcp-operations.md)
- [B1の検証結果](records/cloudflare-b1-quality.md)
- [事業の決定事項](事業設計・決定事項.md)
- [承認済み実装計画と進捗](docs/superpowers/plans/2026-10-19-site-factory-mvp.md)

共通エンジンから顧客ごとに独立したAstroプロジェクトを作る。全顧客へ変更を自動配信しない。顧客向け編集画面・ログインは作らない。

## 検証

```sh
npm test
npm run check:engine
ASTRO_TELEMETRY_DISABLED=1 npm --prefix site-template run check
```

生成済みデモは `clients/demo-editorial`、`clients/demo-photographic`、`clients/demo-structured`。各案とも5ページ＋プライバシーポリシーを持つ。構成、ヒーロー、書体、余白、情報の順序を変えた比較用の出発点であり、全顧客をこの3案に当てはめる運用ではない。

## ローカルで比較する

`npm run preview` は、ビルド済みの3案を127.0.0.1の4337／4338／4339番で配信する。既に使用中なら重ねて起動しない。ブラウザは自動起動しない。停止は実行端末でCtrl+C。

元の3デモは問い合わせ未接続・送信不可。B1専用のqa-form-localと固定候補ではローカルD1保存・偽メール通知を検証した。全出力はnoindexで、robotsも全拒否。本番公開、実Cloudflareアカウント、課金、実メール配送、監視・独立バックアップ、営業送信は後続段階。公開までの制作日数や利益は、この試作から実証されたものではない。
