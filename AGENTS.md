# AGENTS.md

このリポジトリで作業する AI エージェント向けの指針。

## プロジェクト概要

札幌チェスクラブ公式サイト。Astro 7 + Tailwind v4 の静的サイト、GitHub Pages + カスタムドメイン (`sapporochessclub.com`) で公開。日本語/英語の 2 言語対応。フレームワーク JS は一切なし (vanilla `<script>` のみ)。

## アーキテクチャ

- **すべて Astro の静的 HTML + vanilla JS**。Svelte / React 等のフレームワークは使わない
- インタラクションは `<script>` ブロック + `src/lib/*.ts` のヘルパーで実装
- `<dialog>` 要素 (ハンバーガーメニュー)、vanilla listbox (年フィルター) 等のネイティブ API を活用
- hide-on-scroll ヘッダー (headroom) は意図的に複雑。**触る前に `docs/headroom-design.md` を読む**（部分簡素化禁止、二択の設計判断を記載済み）
- ページは薄いロケールラッパー: `src/pages/**` (ja) と `src/pages/en/**` は locale prop を渡すだけで、実体はすべて `src/components/*Page.astro`。**ja/en のページを片方だけ変更しない**
- CSS は全ページ `<style>` インライン化される (Astro の inlineStylesheets)。CSS の 1 変更が全ページに波及する

## 共有部品（新規マークアップを書く前にここを見る）

| 部品 | 用途 |
|---|---|
| `SectionHeader.astro` | セクション h2 + 青ティック。見出しを直書きしない |
| `Breadcrumbs.astro` | 上位階層への導線（詳細/アーカイブページ上部）。「戻る」リンクは作らない |
| `AnnouncementRow.astro` | お知らせ行。`fullDate` prop で TOP/一覧を切替 |
| `ScheduleEventBody.astro` | イベント行本体（バッジ・リンク・時刻・注記） |
| `ExternalLinkIcon` / `RssIcon` / `GlobeIcon` | 共通 SVG アイコン |
| `JsonLd.astro` | JSON-LD の `<script>` 出力。ビルダーの戻り値を `json` に渡す。`<script type="application/ld+json">` を直書きしない |
| `lib/jsonld.ts` | JSON-LD ビルダー（WebSite / SportsClub / Event / NewsArticle）。構造化データはコンポーネント内に書かない。直列化は `serializeJsonLd`（`<` をエスケープ）を通す |
| `lib/breadcrumb.ts` | パンくず JSON-LD。先頭項目は `homeCrumb()` |
| `lib/schedule-data.ts` | スケジュール取得（JST フィルタ・お知らせ slug 解決込み） |
| `lib/schedule.ts` | イベント名・注記の取得（ja フォールバック込み）、連続日の大会の結合 |
| `lib/faq.ts` | FAQ 項目。本文と `llms.txt` で共有 |
| `lib/rss.ts` | RSS フィード（ja/en の `rss.xml.ts` が共有）。人向けの案内は `RssPage.astro`（`/rss/`）。フィードに XSLT を付けない（主要ブラウザが廃止） |
| `i18n` の `getLocalePath` / `getLocaleUrl` / `getRssPath` | 内部リンク・絶対 URL・RSS のパス。`/en` の付け外しを手で組まない |
| `lib/listbox.ts` / `lib/scroll-observer.ts` | 年フィルターの listbox、スクロール観測（headroom 用） |
| `lib/announcement.ts` | お知らせ取得・整形・getStaticPaths 共有実装 |

## i18n

- すべてのユーザー向け文字列は `src/i18n/ja.ts` / `en.ts` に集約
- コンポーネントで `import { t } from "@/i18n"` → `const i = t(locale)` → `{i.foo.bar}`
- `locale === "ja" ? "..." : "..."` のベタ書きは禁止。対象は表示文言で、言語コード（`ja-JP` / `og:locale`）やパスの切替は可
- `en.ts` は `satisfies Shape<typeof ja>` で ja と構造一致をコンパイル時強制。キーは必ず両ファイル同時に追加/削除する
- **CMS の多言語値は ja フォールバック経由で読む**。Pages CMS は `en` を空のまま保存でき、素の `value[locale]` は英語版からその情報（多くは注意書き）を黙って消す。任意項目は `pickTitle` / `pickDescription`（`lib/announcement.ts`）、`getEventName` / `pickNote`（`lib/schedule.ts`）を使う。直接参照してよいのはスキーマで ja・en とも必須の項目（`site.venue.*` / `links.title` / `lessons.*`）だけ
- i18n フィールドを増やしたら `scripts/check-content.mjs` の `I18N_FIELDS` にも加える

## 日付の扱い

クラブは札幌 (JST) なので日付文字列はすべて JST のカレンダー日として扱う。

- `src/lib/date.ts` の `parseDate` / `startOfTodayJST` / `getDateParts` を必ず通す
- `new Date("2026-04-15")` を直接使わない (UTC 真夜中扱いで日付がずれる)
- **表示表記は統一**: 月日 = `07.19`（`formatMonthDay`、0埋め・ドット）、年付き = `2026.07.19`（`formatAnnouncementDate`）。独自フォーマットを組まない

## CMS データ

- スキーマ: `src/content.config.ts` (Zod + Content Layer API)
- CMS: Pages CMS (`.pages.yml` で定義)。**スキーマ変更時は content.config.ts / .pages.yml / 既存コンテンツの 3 点で破綻がないか必ず確認**
- コンテンツはすべて `src/content/` 配下の個別 .md / .yaml ファイル (コレクション方式)
- スケジュール取得は `src/lib/schedule-data.ts` のヘルパーを使う

## デザイン / スタイル

新しい UI は既存コンポーネントの形を踏襲する。以下は破ると実害が出るものだけ:

- **Tailwind v4**: 設定は CSS 内 (`@theme`)、`tailwind.config.*` は無い
- **カラーは `globals.css` の `@theme` トークンのみ**（`text-[#...]` 等の生 hex 禁止）。例外は外部サービスのブランド hover 色（X/JCA/RSS）
- **hover は必ず `[@media(hover:hover)]:` で gate**（モバイルのタップ残留防止）
- **リンク**: ラベルは行き先名。テキストリンクは hover で下線（`underline-offset-2`）— 青リンクは色静止、灰色のリストリンク（Resources/Contact/Footer）は色変化も併用。ナビ UI（Header/ハンバーガー/pill）と行 hover は色/背景変化のみ
- **上位階層への導線は `Breadcrumbs.astro`**（JSON-LD の `buildBreadcrumbJsonLd` と対で使う）
- **間隔は CSS（gap / margin）で付ける** — ソースの空白は `compressHTML: "jsx"` が除去するため効かない
- **角丸は `rounded-md`**
- **タップ領域 44px**（アイコンボタンは `before:-inset-2` で拡張）
- **focus はグローバル `:focus-visible` に任せる**（`outline-none` で消さない）。例外はスキップリンクの着地点 `<main tabindex="-1">`
- **文字サイズは `@theme` の名前付きトークンのみ**（`text-[14px]` 等の任意値禁止。rem でないと利用者の文字拡大に追従しない）。目安: 2xs 12 / xs 14 / sm 16（本文）/ base 18（項目見出し）/ xl 20（セクション見出し、`font-normal`）
- **区切りに中黒「・」や「※」・括弧を使わない**。項目間は gap、注意書きは種類を問わず左罫線つきの独立段（`ScheduleEventBody.astro` の形）
- **中止などの状態は言葉（バッジ）で伝える**。色・打消し線・`opacity` 減光だけに意味を持たせない
- 見た目の調整は足すより引く。「詰まって見える」を文字やサイズの拡大で直さない

## モーション

値と理由は `globals.css` の `@theme` とコメント、経緯は `docs/motion-notes.md` にある。破ると実害が出るもの:

- **曲線は `--ease-calm` / `--ease-exit` の 2 本、尺は `--dur-enter` / `--dur-base` / `--dur-quick` の 3 段**。expo-out 系は使わない
- **クラスに `transition-colors` や `duration-*` を書かない**。`a` / `button` の transition は base の 1 ルールに集約してあり、上書きするとタッチで押下が明滅する
- **入場は個別要素に `.animate-fade-in-up`（+ `.stagger-*`）**。`<main>` にひと塊で付けない。隠す責任は `html.motion-pending` が持ち、アニメーション側に持たせない
- `hidden` 属性での退場アニメは効かない（preflight の `display:none!important`）。入場だけ設計する
- 試して却下済み（再提案しない）: `@view-transition` / Astro `ClientRouter` によるページ遷移演出、入場アニメの削除

## 文言を書くとき

クラブの実態と食い違う表現を書かない:

- 例会も大会も日本チェス連盟の公式戦。「公式戦」は大会だけの説明にならない
- 棋力・レートには触れない（「棋力を問わず楽しめる」も「本格志向」も不可）。初心者向けの歓迎は「見学無料」「教えてくれるメンバーがいる」で書く
- 「幅広い世代が在籍」は誇張。「年齢を問わず参加できます」は可
- チェス講座はクラブ主催ではない（メンバーが別会場で開講）
- 設立年・記事の更新日・大会の料金や空席など、確認できない情報を推定して出さない（JSON-LD も同じ。`docs/ai-search.md`）

## セキュリティ

- `BaseLayout.astro` に CSP meta タグあり
- 外部リンクには `target="_blank" rel="noopener noreferrer"`
- 依存は公開から 7 日たった版だけを入れる（`pnpm-workspace.yaml` の `minimumReleaseAge`）。外して最新版を入れない。CI は依存のコードが動く job に書き込み権限を渡さない。理由は `docs/maintenance.md`
- CMS から来る外部 URL はスキーマの `requiredHttpUrl` / `optionalHttpUrl` で http(s) に限定する（`javascript:` 等を href に出さない）

## コミュニケーション規約

- Issue / PR / 運用ドキュメント → **日本語**
- コミットメッセージ → 英語 (Conventional Commits)
- コード内コメント → 既定は書かない。書くのは「消すと黙って壊れる罠」（CMS / ビルド / デプロイ / a11y）だけ。デザイン判断の経緯はコミットメッセージへ

## 進め方

- フレームワークの新しい既定挙動には config で逆らわず、コード側を合わせる（互換 pin は最後の手段）
- 見た目の調整は実物を見ずに重ねない。主観的な要望や 2 回続けて外れたときは、実スタイルを再現した比較ページを出して選んでもらう。動きは比較ページで再現しきれないので実機で確かめる

## 関連ドキュメント

| ファイル | 読むとき |
|---|---|
| `docs/headroom-design.md` | ヘッダーの hide-on-scroll を触る前 |
| `docs/mobile-compatibility.md` | safe-area・viewport・PWA まわりを触る前 |
| `docs/ai-search.md` | メタ情報・JSON-LD・robots・`llms.txt`・サイトマップを触る前 |
| `docs/operations.md` | CMS での日常更新手順（非エンジニア向け）を変えるとき |
| `docs/maintenance.md` | CI・定期実行・依存の更新を触る前 |
| `docs/motion-notes.md` | 動きを調整する前（否定済みの仮説と却下済みの案） |
| `docs/seo-notes.md` | 検索順位の相談を受けたとき |

## 編集後の確認

```bash
pnpm verify   # 下の 5 つを順に実行。必ず通す
```

| コマンド | 見るもの |
|---|---|
| `pnpm check` | 型チェック。エラー 0 を維持する |
| `pnpm build` | ビルド |
| `pnpm check:search` | canonical・hreflang・サイトマップ・`llms.txt` の整合（ビルド後） |
| `pnpm check:content` | 英訳の欠落・JSON-LD の必須項目・スケジュールの形式と結合規則（ビルド後） |
| `pnpm check:i18n` | ja/en のキー構造・日本語のベタ書き |

- 検査は `scripts/*.mjs`。**Node だけで動かす**（他の道具に頼ると、無い環境で失敗ではなく素通りになる）
- 検査が見るのは構造と整合性まで。見た目・動き・操作は `pnpm dev` で ja/en の両方を目で確かめる
- Node は `.tool-versions` の版を使う（Astro が要求する版より古いと build も check も起動しない。Astro を上げたら要求版を確認する）
- Claude Code では `.claude/scripts/post-edit.mjs` が編集直後に、編集したファイルに応じた検査を走らせる（失敗時だけ報告が返る）。他のツールでは `pnpm verify` を自分で走らせる
- リファクタ時は build 前後の `dist/` を diff して意図しない出力差分がないか確認する
- CI は PR で上の検査をすべて実行する。公開は `main` への push と毎日 15:00 UTC の再ビルド（「今日以降」フィルタをビルド時に評価しているため夜間再ビルドが必須）
