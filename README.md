# 札幌チェスクラブ

[札幌チェスクラブ](https://sapporochessclub.com/) 公式サイトのソースコード。

## 技術スタック

- **Astro 7** — 静的サイトジェネレータ
- **Tailwind CSS v4** — スタイリング (カラートークンは `src/styles/globals.css` の `@theme`)
- **TypeScript**
- **GitHub Pages** — ホスティング (カスタムドメイン)

フレームワーク JS なし。すべて Astro の静的 HTML + vanilla script。日本語/英語の2言語対応 (`src/pages/en/**` は locale を渡す薄いラッパー)。

## セットアップ

```bash
corepack enable   # package.json で固定した版の pnpm を使う
pnpm install
pnpm dev      # http://localhost:4321/
pnpm build    # dist/ に静的ファイル生成
pnpm check    # astro check (型チェック)。エラー 0 を維持
pnpm verify   # 型チェック・ビルド・全検査をまとめて実行。変更を入れる前に必ず通す
pnpm preview  # 本番ビルドをローカルプレビュー
```

## コンテンツ更新

通常運用は **[Pages CMS](https://app.pagescms.org/moom98/sapporo-chess-club/main)** から行います。日常の編集手順は **[docs/operations.md](./docs/operations.md)** を参照。

直接編集する場合の主なパス:

| コンテンツ | パス |
|---|---|
| 例会日程 | `src/content/schedule-meetings/*.md` |
| 大会予定 | `src/content/schedule-tournaments/*.md` |
| 大会記録 | `src/content/tournaments/*.md` |
| お知らせ | `src/content/announcements/*.md` |
| 講座 | `src/content/lessons/*.md` |
| 外部リンク | `src/content/links/links.yaml` |
| 会場・連絡先 | `src/content/site/info.yaml` |

スキーマは `src/content.config.ts`、CMS 定義は `.pages.yml`。両方を同期すること。

## デプロイ / CI

- `main` への push で GitHub Actions が自動デプロイ (`deploy.yml`)
- **毎日 15:00 UTC (0:00 JST) に再ビルド** — 「今後の予定」フィルタと年間スケジュールの「今日」ラインをビルド時の JST で評価しているため、日次再ビルドが日付の鮮度を担保する
- PR には型チェック + ビルドの CI (`ci.yml`)。Dependabot の minor/patch 更新は検証が通った場合のみ自動マージ (`dependabot-automerge.yml`)。major は人間レビュー

## 開発ドキュメント

- **[AGENTS.md](./AGENTS.md)** — コード規約 (i18n・日付・デザイントークン・共有コンポーネント索引)。AI エージェント向けだが人間にも有効
- **[docs/operations.md](./docs/operations.md)** — 非エンジニア向けの日常更新手順
- **[docs/ownership-handover.md](./docs/ownership-handover.md)** — 管理者移譲時の設定・確認手順
- **[docs/maintenance.md](./docs/maintenance.md)** — 保守の注意 (定期実行の自動停止・失敗通知・依存の更新・ドメイン)
- **[docs/headroom-design.md](./docs/headroom-design.md)** — hide-on-scroll ヘッダーの設計判断 (触る前に必読)

## ライセンス

- **コード** (`src/` のコンポーネント・スクリプト・設定類): [MIT License](./LICENSE)
- **コンテンツ・メディア資産**: MIT の対象外。札幌チェスクラブの所有物であり、再利用はクラブの許諾を得てください
  - `src/content/` 配下の全記事・データ
  - `public/competition/` の大会要項・結果 PDF、棋譜 PGN（解析注釈含む）
  - `public/documents/` のパンフレット、`public/images/` の画像
- **第三者資産**: `src/assets/jca-logo.webp` は日本チェス連盟のロゴであり、同連盟に権利が帰属します
