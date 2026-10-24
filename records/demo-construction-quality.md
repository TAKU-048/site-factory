# 建設会社向け営業デモ2種：制作記録

2026-10-21 Claude。最終ゴール指示「まずは建設会社向けの2種類から制作」に基づく。ユーザー承認：無料の商用利用可素材（Unsplash）の使用、営業用デモは認証なしで公開。

## 対象

| 顧客ID | 架空企業 | 目的 | プリセット |
|---|---|---|---|
| demo-build-recruit | 株式会社ミナモト建設（制作デモ） | 若手採用（施工管理・現場スタッフ・大工見習い） | recruit-bold（新規） |
| demo-build-works | 杣建築工房（制作デモ） | 高価格帯の注文住宅の集客・施工例重視 | craft-quiet（新規） |

各5ページ＋プライバシーポリシー。共通エンジン（engine/generate.ts の createClient、assetRoot=briefs/demo-assets）で生成し、顧客専用の SiteLayout / Section / ContactForm / site.css / custom/media.ts を各顧客フォルダ内に作成。共通部品の原本・エンジンは変更していない（presets に2件追加のみ）。

## デザイン方針

- ミナモト建設：コンクリート灰 #EBEDEA、濃紺 #141C2B、仮囲いの黄 #FFD23F。印象に残す要素は写真に重なる黄色のパネル1つ。太いゴシック。スマホは画面下に「見学・応募する」を固定表示（ヒーロー表示中は隠す）。項目の写真で職種を選ばせる。番号は育成ステップ・選考の流れなど順序のある内容だけに使用。
- 杣建築工房：石の灰 #E9EAE6、墨 #1F2420、苔 #4F5D46、明朝見出し＋ゴシック本文。印象に残す要素はトップの縦書き見出し。施工例は大小をつけた非対称の写真配置と、新築／リノベーションの絞り込み（JSなしでは全件表示）。
- 自己点検で修正：当初クリーム地＋明朝＋テラコッタ（生成サイトに多い組み合わせ）になりかけたため石の灰と苔色に変更。PCで見出しが「人へ。」だけ改行されたため幅と字送りを調整。同じ家の写真を2件の施工例に使っていたため1件削除し、2階建ての写真に「平屋」と付けていた名称を修正。

## 誤認防止

- 全ページ上部に「ホームページ制作の見本として作った架空の会社のサイト。写真は素材サイト（Unsplash）のもので、実在の会社・人物・求人／施工事例ではない」と表示。
- 社員の声・口コミ・受賞・施工数などの架空の実績は作らない。募集要項の金額は「架空の例」と明記。
- 有名な旧邸・美術館など建物が特定できる写真は候補から除外。
- フォームは入力と確認表示のみで、通信処理を持たない（送信ボタン押下時のGET以外のリクエスト0件を確認）。
- noindex・robots全拒否（テンプレートの既定）を維持。

## 実測（Chromium、file配信ではなくローカルHTTP）

- 2デモ×6ページ×360/375/768/1280px＝48条件：横はみ出し0、48px未満の操作要素0、画像の読み込み失敗0。
- 最小コントラスト：ミナモト建設 8.57:1（写真の出典表記）、杣建築工房 6.86:1。
- astro check：両方エラー・警告・ヒント0。build：各7ページ。
- 絞り込み：全8件→リノベーション4件→新築4件→全8件。状態を aria-live で通知。
- 未検証：実機スマートフォン、Safari、システムフォント差（検証環境に Hiragino が無く代替書体で確認）。

## 写真（すべて Unsplash License、商用利用可・クレジット任意。サイト上部と alt の source に出典を記録）

| 素材ID | 撮影者 | Unsplash ID | 撮影地（ページ記載） |
|---|---|---|---|
| recruit-hero | Josh Olalde | X1P1_EDNnok | Houston, USA |
| job-manager | GN Group | 9gCRnfwSkwo | - |
| job-site | d c | TEWLnoJRPzY | - |
| job-carpenter | Yohan Cho | hMfmDP627uc | Korea |
| job-foundation | Glenov Brankovic | DWp5nUqTn6E | - |
| workplace-street | Leongsan | Yw5u_ZvQfrs | Shibuya, Japan |
| detail-toolbelt | Callum Hill | oamw52SCGi0 | New Zealand |
| works-hero / works-facade | Alef Morais | emnfe1YR6io / p9jDz1AbLig | - |
| works-living / works-stair | Caroline Badran | 75b60epaBAs / vQc0ZDy7Wv8 | - |
| works-kitchen | João Emanuel | mOeqZq0gwVE | - |
| works-dining | Polina Kuzovkova | 4CEj-n9CLdc | - |
| works-garden-room | A. L. Brown | QHegVZW6i_I | Gold Coast, Australia |
| works-snow | mark wang | 8yuW0QmamGw | Hokkaido, Japan |
| works-wall | Yanhao Fang | XTOBy9z5Sgs | Kyoto, Japan |
| craft-tools | HENG YIN | KKY0GrQPqVo | - |

取得：images.unsplash.com から幅1800pxで取得し、1600px・800pxのWebP（品質76）に変換して briefs/demo-assets/ と各顧客の public/assets/ に保存。Unsplash+（有料）の写真は使用していない。人物が写る写真を実在の社員として紹介しない。

## 公開

deploy/demos/<顧客ID>.wrangler.jsonc（静的配信のみ、workers.devのみ、未検出URLは404.html）。公開URL予定：https://demo-build-recruit.tk-sites.workers.dev 、https://demo-build-works.tk-sites.workers.dev 。

## 2026-10-21 追記①：建設2種の作り直し（ユーザー指摘「一般的な作りで魅力的に見えない」）

業種の題材から動きと背景を作り込み、各サイトの「見せ場」を増やした。共通エンジン・site.jsonの文章は変えず、顧客フォルダ内の Section / SiteLayout / site.css / scripts/motion.ts を作り直した。

- ミナモト建設：青焼き図面の方眼背景（ゆっくり流れる）、家の骨組みの線画が描かれるヒーロー、見出しの行ごとのせり上がり、黄色い仮囲いの板が外れて写真が見える演出、横断幕の帯（止めるボタン付き）、スクロールで伸びる育ち方の線、自作の線画アイコン、動く工事用縞の応募帯、Q付きFAQ、影付きフォーム。
- 杣建築工房：施工例4枚のゆっくりした切り替え（止めるボタン・枚数ボタン付き）、窓から差す光が横切る演出、縦書き見出しの列ごとの表示、障子が左右に開いて写真が現れる演出、和紙の質感、施工例を大きく見るダイアログ（前後移動・Esc・フォーカス復帰を確認）、写真のわずかな視差、写真背景の相談帯。
- 動きを減らす設定（prefers-reduced-motion）では、全演出を止め完成状態で表示。

## 2026-10-21 追記②：他業種のデモ（ユーザー依頼「建築以外のジャンルも」）

最終ゴール指示の初期デモ候補（飲食店・美容室）から2種を追加。業種プロファイル restaurant / beauty とプリセット noren-night / mirror-soft を追加。

| 顧客ID | 架空の店 | 見せ場 |
|---|---|---|
| demo-food-ramen | 中華そば 灯（制作デモ） | 藍の暖簾が左右に分かれて一杯が見えるヒーロー、立ちのぼる湯気、揺れる提灯、丸い丼の写真、木札のお品書き（揺れて掛かる）、日本時間で「ただいま営業中／次は17:30から」を自動表示、駅から店までの道順が描かれる地図（架空の場所と明記） |
| demo-beauty-salon | hair studio Lune（制作デモ） | アーチ型の鏡の枠、鏡に走る光、髪の流れの線が描かれる背景、写真が鏡の形に下から現れる演出、スタイルの横スクロール（前後ボタン）、点線でつないだ料金表、スタイルの絞り込み、スマホの予約ボタン |

誤認防止：両サイトとも上部に「架空の店・写真は素材サイト・実在の店／料理／施術例ではない」と表示。価格・営業時間は架空の例と明記。スタイル写真は「素材サイトのモデル写真で施術例ではない」と明記。口コミ・ランキング・受賞歴は作らない。実在店の看板・有名チェーンの丼・実在サロンが撮影地の写真は除外。最初のヒーロー候補（丼の縁に店名らしき文字）は差し替えた。

実測：ラーメン4ページ・美容室6ページ×360/375/768/1280px＝40条件で、横はみ出し0・48px未満0・画像欠損0。最小コントラスト：美容室6.21:1、ラーメン6.34:1（提灯の装飾文字を除く）。astro check：両方エラー・警告0。

### 追加写真（Unsplash License）

| 素材ID | 撮影者 | Unsplash ID |
|---|---|---|
| ramen-hero | Muhammad Fawdy | jIWQr6T2M6g |
| ramen-special | Andy Luo | c-GA4Matd7U |
| ramen-shoyu | Ruben Mavarez | iLDoHJrdf5s |
| ramen-shio | Michele Blackwell | rAyCBQTH7ws |
| ramen-miso | Viktor Ritsvall | dkMNiNrvYiA |
| side-gyoza | Mikey Frost | klTf2RN37Ts |
| shop-counter | Agata Malankiewicz | nv3T3tv2KrM |
| salon-hero | Barney Goodman | _Fy7Kq0w6OI |
| salon-seat | Stefan Vibes | N15dzf3dAUk |
| salon-shampoo | Lindsay Cash | Md_DhaFsnCQ |
| salon-blow | Jenna Oslin | MmDO1-ezCE4 |
| salon-cut | Farhad Ibrahimzade | V2HDOQTJh3o |
| salon-curl | Baylee Gramling | MMz03PyCOZg |
| style-short-red / style-side | amirreza momennia | Lc1TdKaBCbI / Q4ZRhIhHJMo |
| style-pixie | Alex Perez | vXQza9AUe40 |
| style-bob | Luis González Sosa | vVwh7OwCVXk |
| style-color | Clay Elliot | ED1mz7orJVw |

公開設定：deploy/demos/demo-food-ramen.wrangler.jsonc、deploy/demos/demo-beauty-salon.wrangler.jsonc。

## 2026-10-21 追記③：運送・物流と介護・福祉のデモ（ユーザー指摘「飲食店・美容院は専用プラットフォームがあり、ホームページの重要度が低い」）

最終ゴール指示の業種一覧から、ホームページの役割が大きい2業種を追加。業種プロファイル logistics / care とプリセット night-route / komorebi を追加。飲食店・美容室のデモは削除せず残し、デモ一覧に載せるかは未決定。

| 顧客ID | 架空の事業者 | 見せ場 |
|---|---|---|
| demo-logistics | 株式会社朝凪運輸（制作デモ） | 夜の幹線道路の写真に光の筋が流れるヒーロー（止めるボタン付き）、道路の破線が流れる帯、日本時間で「ただいま配車受付中」を自動表示、拠点から6地域へ線が引かれて点が走るルート図（一覧を選ぶと該当の線を強調・方角の模式図と明記）、2t/4t/10tを選ぶとトラックが走り込んで荷台にパレットが並ぶ車格選び、高速道路の緑の案内標識が振れて掛かる「4つの約束」、スクロールで道路上を進むトラック（依頼の流れ・ドライバーの1日）、倉庫のシャッターが上がる見積もり帯、「お見積り／応募・見学」で項目が切り替わるフォーム |
| demo-care-day | デイサービス こもれび舎（制作デモ） | 木漏れ日の光がゆっくり揺れ葉の影がそよぐヒーロー（止めるボタン付き）、アーチ型の窓の写真、スクロールに合わせて太陽が空をたどり空の色が朝→昼→夕に変わる「1日」、アルバムに貼られるように置かれる写真、線が引かれるアイコン、湯気の立つ湯のみと縁側の板張りの相談帯、季節を選ぶと背景と舞うもの（花びら・蛍・葉・雪）が変わる行事紹介、飛び石の「ご利用までの流れ」、「文字を大きく」ボタン（約1.2倍・この端末にだけ記憶） |

誤認防止：両サイトとも上部に「架空の事業者・写真は素材サイト・実在の会社／車両／施設／利用者ではない」と表示。許可番号・車両台数・所在地・料金は「デモのため掲載していません」と明記。運送の走行時間は「架空の拠点からの目安」、ルート図は「方角の目安で実際の地図ではない」と明記。介護は効果・改善を断定せず、料金は介護保険の自己負担の考え方のみ。口コミ・実績数値・事故ゼロ等は作らない。

写真の除外：実在の会社名（「山本商会」）が車体に写るトラック、実在の施設名の看板が写る通り、ドライバーが運転席で喫煙している写真（採用ページに不適）、車体の型式表示が大きく写る切り抜きは不採用。

実測：運送6ページ・介護6ページ×360/375/768/1280px＝48条件で、横はみ出し0・48px未満の操作部品0・画像欠損0・JSエラー0。最小コントラスト：運送6.06:1、介護5.5:1。astro check：両方エラー・警告0。

### 追加写真（Unsplash License。centre for Ageing Better はPublic Domain併記）

| 素材ID | 撮影者 | Unsplash ID |
|---|---|---|
| logi-hero | 515 Freedom | KtgvZOHrZc4 |
| logi-dusk | Josiah Farrow | ucuOscdCaO4 |
| logi-tunnel | jay huang | aeouwx28n6M（右側のトラックを含まないよう切り抜き） |
| logi-warehouse | Kseniia Ilinykh | 82ZiY5pzl1c |
| logi-racks | AFINIS Group | laEcTC9zXXg |
| logi-fleet | Nigel Tadyanehondo | GOD2mDNujuU |
| logi-handover | Handy Wicaksono | brizG9kR6qI |
| logi-shelves | Arno Senoner | yqu6tJkSQ_k |
| care-walk | micheile henderson | PpZasS086os |
| care-light | Jakayla Toney | sl0v1Ud9Eqk |
| care-coloring | Age Cymru | bSXk1lOp8T0 |
| care-reading | Centre for Ageing Better | rQJ3xo-0WYE |
| care-meal | Takafumi Yamashita | f7REE1J7k9k |
| care-garden | Sandie Clarke | q13Zq1Jufks |
| care-hands | Joshua Hoehne | 0F4duBPWlCw |
| care-tea | Theme Photos | iLFOK7ntmgs |
| care-blue | Trương Tuyết Ly | P1AGAowPnXc |

公開設定：deploy/demos/demo-logistics.wrangler.jsonc、deploy/demos/demo-care-day.wrangler.jsonc。公開はユーザーのWrangler実行待ち。
