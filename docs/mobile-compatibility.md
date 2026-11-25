# モバイル端末の互換性

## 方針

OS・機種名による振り分けは行わず、画面幅とブラウザーの標準機能に追従する。
日本語・英語とも共通コンポーネントで対応する。

- `viewport-fit=cover` と `safe-area-inset-*` を組み合わせ、本文・ヘッダー・フッター・全画面メニュー・言語案内をノッチやホームインジケーターから離す。
- ヘッダーに上端余白が付く場合は `scroll-padding-top` も追従させる。
- メニューの高さは `100dvh`。Fold 展開や回転でトリガーが非表示になった場合は即時に閉じ、デスクトップのナビへフォーカスを戻す。
- 年フィルターはリサイズ時に表示領域内の高さを再計算し、トリガーが非表示になったら閉じる。
- 長い英単語や URL は必要な場合に折り返す。
- 既存の Safari の URL バー伸縮・ラバーバンド対策は維持する（`headroom-design.md` 参照）。

## iOS Safari 26 以降の、画面上下の帯の色

2026.11.26 に iPhone 実機（Safari）で確認。

iOS 26 以降の Safari は、画面上端（時計まわり）と下端（ツールバーまわり）の帯を、ページ側の色で塗る。`theme-color` は使われない。色の出どころは「端に固定された要素の background-color」か「ページの地色」で、**画面全体を覆う要素の色は拾われない**（公開されていない挙動。開発者の検証記事による）。

このため、全画面メニューの幕は**ページの地色と同じ色**にしている。以前は暗い幕だったが、次の問題が出た。

- メニューを開いても上下の帯が白いまま残る
- 幕と同じ色の細い帯を端に固定すれば帯は暗くなるが、Safari 自身の塗り替えが遅れてついてくる。実機の収録で、開くとき約 0.3 秒、閉じるとき約 0.5 秒、帯の色がメニューとずれた。閉じた直後は時計の表示も一時的に見えなくなった。この遅れはサイト側から変えられない

幕を地色と違う色に戻すと、同じ問題が再発する。

あわせて分かったこと:

- Safari は `dialog.close()` の瞬間に dialog を top-layer から外す（`overlay` の transition が効かない）。退場フェードの間も同じ場所に描かれるよう、`.hamburger-dialog` に `position: fixed; inset: 0; margin: 0` を明示している
- メニュー上段のロゴは、ページのヘッダーのロゴと同じ位置・同じ色で重なる。上段を動かすと二重にぶれて見えるので、開閉の動きは上段より下（`.menu-move`）だけに付けている

## 参照した公式情報

- [WebKit: Safe area の設計](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)
- [Tailwind CSS: ブラウザー互換性](https://tailwindcss.com/docs/compatibility)
- [Chrome: Viewport Segments API](https://developer.chrome.com/blog/viewport-segments-api-shipped)

Tailwind v4 の基本目安は Safari 16.4+ / Chrome 111+ / Firefox 128+。
サイト全体の実機保証や、すべての装飾・アニメーションの最低対応版を意味しない。

Chrome の Viewport Segments API は Chrome 138 から提供されるが、ブラウザー間で対応に差がある。
現状は画面幅変更への追従を実装し、ヒンジをまたぐ二画面専用レイアウトは実装していない。
通常の Fold の幅変更検証と、物理的に表示できないヒンジ領域の検証は区別する。

## 実機での確認項目

- iOS 27 Safari / Android Chrome / Samsung Internet で縦横切り替え。
- ノッチ側の左右余白、画面下端のリンク、ホーム画面起動時の上端余白。
- アドレスバーの開閉、ピンチズーム、文字サイズ拡大。
- Fold の外画面→内画面→外画面。メニュー・年フィルターを開いたまま切り替える。
- Android の戻る操作、iOS の戻るスワイプ、バックグラウンドからの復帰。
- 二画面端末のヒンジをまたぐ表示。

デスクトップ上の Chromium / WebKit による画面幅検証は、実機の Safari / Samsung Internet の検証を代替しない。

## 2026-09-28 の検証

- ビルド: 97 ページ生成成功。
- 型チェック: 0 errors / 0 warnings / 69 hints（既存の非推奨 API 等）。
- 実行環境の pnpm による自動依存再インストールを避けるため、`pnpm --config.verify-deps-before-run=false build` と同 `check` を使用。
- ローカル Chromium のタッチ設定で日英のトップ・スケジュール・大会・お知らせ一覧を 320 / 360 / 390 / 640 / 768 / 884 CSS px 幅で検証。横はみ出し・JavaScript 例外なし。
- メニュー開閉、360→884px の展開時のモーダル解除、年フィルターの高さ変更・非表示時の閉鎖・選択操作を確認。
- 英語トップの 360px 幅のスクリーンショットを目視確認。
- ローカル WebKit はブラウザーの起動が完了せず未検証。iOS 27 実機・Android 実機・Samsung Internet も未検証。
- 全97ページを 320 / 884 CSS px 幅でも検証（194ケース）。横はみ出し・JavaScript 例外なし。
