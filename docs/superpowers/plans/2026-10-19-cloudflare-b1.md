# Cloudflare B1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. 現在のチャット内で順に進める既定方針を維持する。

**Goal:** 問い合わせを失わずに保存し、通知障害を再現・復旧できるローカル版と、内容を固定した公開候補を作る。

**Architecture:** 静的Astroサイトに顧客別Worker／D1を加える。受付とoutboxを同時保存し、通知は分離する。外部サービスを差し替える境界を設け、B1ではローカルのみで検証する。

**Tech Stack:** 既存Node.js／TypeScript／Astro、Cloudflare Workers・D1、Wranglerのローカル実行環境、Node標準テスト。メールSDK・UIライブラリは追加しない。

**Spec:** `docs/cloudflare-b1-design.md`

## Global Constraints

- 実装は承認後。新規取得対象はWranglerと付随するworkerd／Miniflare等の依存。保存先はruntime/cloudflare/node_modules、キャッシュは.cache/npm。グローバル導入なし。
- 取得直前に公式配布元・ライセンス・対応Node・インストールスクリプトを確認し、採用版をpackage-lock.jsonとdocs/resource-register.mdへ固定する。追加実行スクリプトが必要なら内容を調べて必要分だけ実行する。
- B1はローカルHTTPだけ。実キー、remote D1、Cloudflareログイン、リモートdeploy、課金、DNS変更、外部メール送信、定期起動、自動削除は対象外。
- JSONは32KiB、フォーム最大10項目、name100文字／email254文字／message5,000文字／任意項目1,000文字。
- 日本語UI、事実を補わない。操作領域48px以上、focus-visible、reduced-motion、360px／375pxで横はみ出し0。
- 顧客コピーを分離し、既存顧客へ自動反映しない。履歴・以前の候補・テスト生成物を削除しない。
- Gitが初回コミット前かつ.git書込制約下の現状では、承認済み専用フォルダで実装しrecords/progress.mdへ変更と検証を記録する。コミットのために権限を拡大しない。

## Review Focus

1. Turnstile検証済みリクエストの再送：同じ受付番号だけを返し、二重保存しない（Task 1）。
2. メール成功後にDB更新失敗：固定したキーで再試行し、24時間境界後はunknownで停止する（Task 2）。
3. 大きな日本語本文・Content-Lengthなし：ストリーム実量32KiBで拒否し、DBへ書かない（Task 1）。
4. 未接続デモと本番設定の混同：既存デモは送信不可、localアダプターの本番選択は拒否する（Task 3）。
5. CSSだけの変更・秘密設定の版変更：古い公開候補の承認が成立しない（Task 4）。

## Task 1：入力検証・D1への原子的な受付

**Files:** 作成runtime/cloudflare/package.json、tsconfig.json、wrangler.local.jsonc、src/types.ts、src/contact.ts、src/store.ts、src/worker.ts、src/turnstile.ts、src/rate-limit.ts、migrations/0001_contact.sql、tests/contact.test.ts、tests/store.test.ts、tests/local-d1.test.ts。変更docs/resource-register.md。

**Interfaces:** `handleContact(request:Request, deps:ContactDeps):Promise<Response>`。`ContactDeps`は検証器、頻度制限、顧客固有設定、時計、`ContactStore`を持つ。`ContactStore.accept(input:ValidatedContact):Promise<{receiptId:string;duplicate:boolean}>`は同じrequestId・異なるpayloadHashで競合を返す。`verifyTurnstile(token:string):Promise<{success:boolean;hostname?:string;action?:string}>`。`RateGate.allow(key:string):Promise<boolean>`。

- [x] 上記新規依存の承認後、公式版情報を調べて固定・取得し、ローカル実行環境を用意する。秘密値や本番アカウントを参照しない。
- [x] 正常受付、保存失敗503、同時重複1行、本文変更409、Origin不一致403、期限切れ・hostname/action不一致、頻度超過429、上限超過413のテストを書く。重複リクエストではTurnstile検証器を再度呼ばず、既存受付番号以外を返さないことをassertする。
- [x] `node --experimental-strip-types --test runtime/cloudflare/tests/contact.test.ts runtime/cloudflare/tests/store.test.ts`を実行し、未実装による失敗を確認する。
- [x] 入力・許可先・検証アダプターを実装。D1にinquiriesとoutboxを作り、requestId UNIQUEと原子的batchを使う。2つ目の書込失敗時に問い合わせだけが残らないことを確認する。ログに本文・メール・IPを出さない。
- [x] 上記テストを成功させる。`npm --prefix runtime/cloudflare run test:local`を定義し、WranglerのローカルD1で実SQLのロールバック・同時重複を確認する。接続がremoteなら試験を拒否する。
- [x] 結果・採用版・ローカルDBパスを進捗へ記録する。

## Task 2：通知と再試行の状態管理

**Files:** 作成runtime/cloudflare/src/notify.ts、src/resend.ts、src/outbox.ts、src/local-services.ts、tools/retry-local.mjs、runtime/cloudflare/tests/notify.test.ts、tests/outbox.test.ts。変更src/types.ts、src/store.ts、src/worker.ts。

**Interfaces:** `NotificationSender.send(job:NotificationJob):Promise<SendResult>`。SendResultはaccepted（providerIdあり）／retryable／permanent／uncertain。`runOutbox(deps:OutboxDeps):Promise<{accepted:number;retrying:number;failed:number;unknown:number}>`。Task 1のContactStoreと同じDBを用いる。時刻・送信先・試行内容をジョブ作成時に固定する。

- [x] 二重起動、送信前クラッシュ、送信後DB更新失敗、429／5xx／タイムアウト／恒久4xx、初回から24時間経過、変更された通知先のケースを書く。同じキー・同じ内容を維持し、acceptedをdeliveredにしないことをassertする。
- [x] `node --experimental-strip-types --test runtime/cloudflare/tests/notify.test.ts runtime/cloudflare/tests/outbox.test.ts`で失敗を確認する。
- [x] leaseによる取得、仕様の再試行時刻・Retry-After、24時間境界、unknownへの停止を実装する。テンプレートはHTMLエスケープ、固定From／Toと検証済みReply-Toを使う。Resendアダプターはfetchを注入可能とする。
- [x] テストを成功させ、ローカルHTTPの偽メールサーバーで「受付成功→通知失敗→再試行→accepted、保存1件」を実証する。実APIホストへアクセスしようとした試験は即失敗させる。
- [x] 手動のretry-localコマンドと本文なし管理件数出力を記録する。Cronを有効にしない。

## Task 3：フォームと静的配信の結合

**Files:** 作成site-template/src/scripts/contact.ts、runtime/cloudflare/tests/routing.test.ts、tests/form-build.test.ts、tools/prepare-form-demo.mjs。変更site-template/src/components/Section.astro、src/styles/site.css、engine/domain.ts、engine/validate.ts、engine/generate.ts、runtime/cloudflare/src/worker.ts、wrangler.local.jsonc。

**Interfaces:** 公開データに`form.mode:'disconnected'|'local'|'production'`、安全な公開sitekeyだけを持たせる。旧connected:falseはdisconnectedとして読み込む。顧客の通知先・秘密はWorker設定だけに置く。`submitContact(payload,requestId)`はTask 1のAPIへ接続する。

- [x] 未接続の既存デモはdisabled、検証サイトだけ送信可能、local検証器でproduction起動拒否、存在しないAPIはJSON404、別メソッド405、静的ファイルはASSETS配信というテストを書く。
- [x] `node --experimental-strip-types --test tests/form-build.test.ts runtime/cloudflare/tests/routing.test.ts`の失敗を確認する。
- [x] 仕様の送信中・成功・失敗を実装する。連打は同じrequestId、明示的な新規受付だけ新ID。失敗時の入力保持、成功時クリア、エラーのフォーカスを実装。公開には/APIの接続確認が必要な状態を持たせ、localだけで本番readyにしない。
- [x] テストを成功させ、B1専用デモを新規生成。承認済み検証ブラウザで360／375／1280px、キーボード、保存失敗、再送、文字上限を実操作する。外部Turnstileは読まず、ローカル検証器を使った結果と明記する。
- [x] 既存`npm test`と`npm run check:engine`、専用デモのcheck／buildを実行し、実測を保存する。

## Task 4：公開候補の固定・受入記録

**Files:** 作成engine/release.ts、tests/release.test.ts、docs/cloudflare-local-operations.md。変更engine/cli.ts、engine/report.ts、records/progress.md。

**Interfaces:** `prepareRelease({clientRoot,outputRoot,secretRevision}):Promise<{releaseId:string;manifestPath:string}>`、`verifyRelease({releaseRoot}):Promise<{valid:boolean;changed:string[]}>`。manifestはpath／sha256の一覧、clientId、環境local、secretRevisionを持つ。入力・出力は許可ディレクトリ内、symlinkを拒否する。

- [x] CSS／Worker／静的出力だけの変更、secretRevision変更、公開領域への秘密候補混入、symlink、不足成果物、既存候補名の衝突をテストにする。元フォルダは変えず、新候補IDになり、古い承認を引き継がないことをassertする。
- [x] `node --experimental-strip-types --test tests/release.test.ts`で失敗を確認する。
- [x] ビルド済み出力・バンドル・ロック・非公開設定を許可リストで候補へコピーし、ハッシュを計算する。除外対象をmanifestに含めない。リモートdeployコマンドは作らない。
- [x] テスト、engine型チェック、ローカルD1結合試験、専用デモcheck／buildを成功させる。本文・鍵のログ流出がないこと、通常静的閲覧でWorker受付コードを呼ばないことも確認する。
- [x] 保持した候補からローカル起動し、受付・通知の復旧を再現する。ブラウザを片付け、検証サーバーの終了を確認する。
- [x] 自己レビューで仕様と各Taskを照合し、検証結果・未検証の実サービス接続・B2の具体的な次手順を記録して報告する。

## 計画の自己点検

2026-10-19：仕様の受付・保存・通知はTask 1〜2、画面と配信はTask 3、変更の検知はTask 4へ対応付けた。Review Focusの5項目をそれぞれのテストへ割り当てた。実アカウント、配送Webhook、監視、独立バックアップ、保持期限の自動処理はB2／B3へ明示的に残す。既存の実行方法を維持し、承認前の依存取得や実装は行わない。

## 実装結果

2026-10-19：B1の4タスクをローカルで実装・検証。records/cloudflare-b1-progress.mdとrecords/cloudflare-b1-quality.mdを参照。実サービス接続と本番公開はB2。残るMinorはUUID v4の16進数への厳密化。
