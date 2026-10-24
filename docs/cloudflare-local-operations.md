# Cloudflare B1：ローカル検証の操作

実Cloudflare・Resendへ接続しない検証環境。入力は架空データだけを使用する。実サービスでの送信・保存・DNS／SSL・配送到達はB2で確認する。

## 起動

Node.js 24.14.1で検証。Wrangler 4.151.1、Miniflare 5.20261012.1-betaを案件内に固定。インストールスクリプトを実行せず、取得済みのプラットフォーム用バイナリを使う。

```sh
npm --prefix runtime/cloudflare run migrate:local
node tools/fake-mail-local.mjs
npm --prefix runtime/cloudflare run dev
```

偽メールAPIとdevは別端末。127.0.0.1の4350がサイト、4351が偽メール。ブラウザは自動起動しない。フォームは/contact/。検証条件を「保存障害」「認証期限切れ」にすると入力を残して失敗する。「正常」で受付番号を表示する。

```sh
node tools/retry-local.mjs
npm --prefix runtime/cloudflare run summary:local
```

再試行は手動。偽メールAPIは最初の送信を503、その後はAPI受理として返す。実際のメールを配送しない。acceptedは受信箱への到達を意味しない。処理待ちの次回時刻までは再送しないため、1分未満で繰り返しても状態は変わらない。理由コードはprovider_accepted（API受理）、temporary_rejection（一時拒否）、delivery_uncertain（結果不明）、permanent_rejection（恒久拒否）、idempotency_expired（24時間経過）、retry_exhausted（試行上限）、retry_after_outside_window（再試行指定が期限外）。

ローカルDBはruntime/cloudflare/.local-state/v3/d1。問い合わせ本文は管理一覧に出さない。Wrangler設定・ログは案件内.cacheへ固定し、既存ユーザーのCloudflare設定を使わない。

## 自動試験

```sh
npm test
npm run check:engine
npm --prefix runtime/cloudflare test
npm --prefix runtime/cloudflare run check
npm --prefix runtime/cloudflare run test:local
```

test:localは127.0.0.1でworkerdを起動する。NodeのSQLite警告は試験用アダプターだけで、本体はD1。過去の試験フォルダやDBは自動削除しない。

## 公開候補

候補IDと場所はrecords/b1-release.json。releases/<ID>/manifest.jsonで照合する。候補のsite/distだけが静的配信対象で、site/cloudflareは非公開運用資産。候補全体を静的ホストへアップロードしない。

```sh
node --experimental-strip-types engine/cli.ts verify-release --destination <候補ID>
node tools/wrangler-local.mjs migrate-candidate
node tools/wrangler-local.mjs dev-candidate
```

候補の起動前に通常devを止める。別の.candidate-stateで保存試験を行う。候補起動時の集計は `npm --prefix runtime/cloudflare run summary:candidate` を使う。同じ4350番を使う。改変された候補は起動前の照合で拒否する。実行時は.cache/candidate-runs内に検証済みコピーを作り、一時ファイルが固定候補に混ざらないようにする。候補の保存には承認済みソース・ビルド・Worker・依存ロック・非公開設定を含む。secretRevisionは秘密設定の版であり、秘密値そのものではない。

B1の候補はlocal/noindex。B2では実接続を検証し、本番設定で別の候補を作り、公開承認を得る。候補IDは内容の変更検出用で、第三者に対する電子署名ではない。

## 停止と復旧

各実行端末でCtrl+C。4350／4351にLISTENがないことを確認する。再起動時もローカルD1は残る。通知後に処理が落ちた場合は期限付きleaseの失効後、同じキーで再試行する。初回から24時間以上経過した未確定通知は自動再送しない。DBの復元後に通知を一括再送せず、履歴との照合を先に行う。

## B2へ進む前に

実アカウント・認証済み送信元・固定受信者、プレビューのアクセス制御、独自ドメインと既存メールのDNS、Turnstileのhostname/action、署名検証Webhook、通知の到達／バウンス、復旧、使用量を確認する。保持期間・独立バックアップ・自動削除は未確定。本番公開、課金、DNS変更、外部送信、Cron有効化は別途承認対象。

候補のWorker専用tsconfigを置いているが、Wranglerは静的サイト側のAstro継承設定を検出して警告する場合がある。候補起動にはAstroの依存を再導入せず、ビルド済み配信とWorker受付・通知の実動作を確認した。ソースから再ビルドする際はlockfileに従う依存導入が別途必要。
