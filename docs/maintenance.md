# 保守の注意

サイトを預かる人（と、その人が使う AI）が、知らないと困ることをまとめる。日々の更新手順は [運用ガイド](./operations.md)、コードの決まりは [AGENTS.md](../AGENTS.md)。

## 変更を入れる前の確認

```bash
pnpm verify
```

型チェック → ビルド → 検索向け検査 → 内容検査 → 文言検査を順に走らせる。どれかが落ちたら公開しない。検査はすべて Node だけで動く（`scripts/`）。

検査が見るのは出力の構造と整合性まで。**見た目・動き・操作（メニューの開閉、大会記録の年フィルター、ヘッダーの出入り）は自動では確かめられない**ので、`pnpm dev` を開いて日本語版と英語版の両方を目で見る。

## 自動で動いているもの

| 仕組み | いつ | 止まるとどうなるか |
|---|---|---|
| 公開（`deploy.yml`） | `main` への push と毎日 00:00 JST | サイトが更新されない |
| 夜間の再ビルド（同上の定期実行） | 毎日 00:00 JST | 「今日以降の予定」が古いまま残り、終わった例会が TOP に出続ける |
| 依存の自動更新（Dependabot） | 毎週月曜 | 脆弱性の修正が入らなくなる |

### 定期実行は 60 日で自動停止する

GitHub は、リポジトリに 60 日間動きがないと定期実行を止める。CMS の更新や依存の自動更新があれば止まらないが、更新が途絶えた時期に起きる。

- 確認: GitHub の Actions タブ → Deploy to GitHub Pages。停止中は「This scheduled workflow is disabled」と出る
- 復旧: 同じ画面の **Enable workflow** を押し、**Run workflow** で一度公開する

### 失敗の通知は「定期実行の設定を最後に書き換えた人」に届く

夜間の再ビルドが失敗したとき、GitHub がメールを送る相手は、`deploy.yml` の `cron` の行を最後に変更した人。管理者が替わっても自動では切り替わらない。

新しい管理者は、自分のアカウントで `cron` の行を一度編集してコミットする（時刻は変えず、コメントを足すだけでよい）。CMS の保存や手作業の push による公開が失敗したときは、その操作をした本人に届く。

## 依存の更新

- **minor / patch は自動でマージされる**。型チェック・ビルド・検索向け検査が通ったものだけ
- **major は PR が残る**。人が内容を見て判断する
- **TypeScript 7 は止めてある**（`.github/dependabot.yml` の `ignore`）。型チェックに使う `@astrojs/check` が TypeScript 6 までしか対応していないため。対応したら `ignore` を外す。確認方法:

  ```bash
  pnpm view @astrojs/check peerDependencies
  ```

- **`pnpm audit` に 2 件残っている**（2026.11.11 時点）。どちらもビルド時だけ使う間接依存で、公開されるサイトには含まれない。上流の更新待ちで、こちらで直す手段はない

### 乗っ取られた依存への備え

依存は約 440 個あり、そのどれかが乗っ取られると、ビルド中に生成物へ悪意あるコードを混ぜられる。数は減らせないので、入ってくる経路を絞っている。どれも外さないこと。

| 備え | 場所 | 防ぐもの |
|---|---|---|
| 公開から 7 日たっていない版を入れない | `pnpm-workspace.yaml` の `minimumReleaseAge`、`.github/dependabot.yml` の `cooldown` | 乗っ取られて公開された直後の版（多くは数日で取り下げられる） |
| インストール時のスクリプト実行を 2 つに限定 | `pnpm-workspace.yaml` の `allowBuilds` | 入れただけで動く悪意あるスクリプト |
| 版を完全に固定 | `pnpm-lock.yaml` と CI の `--frozen-lockfile` | 知らないうちの差し替え |
| 依存のコードが動く job に書き込み権限を渡さない | 各ワークフローの `permissions` | 乗っ取られた依存によるリポジトリの書き換え・勝手な公開 |
| アクションをコミット番号で固定 | 各ワークフローの `uses:` | タグの付け替えによる差し替え |

これで危険は小さくなるが、無くなりはしない。7 日以上気づかれなかった乗っ取りは通る。手元で `pnpm install` や `pnpm build` を走らせるときは、依存のコードが自分の権限で動くことを忘れない。

依存を手で更新するときは `pnpm update` を使う（待ち時間の設定が効く）。`minimumReleaseAge` を一時的に外して最新版を入れない。

**待ち時間と急ぎの修正がぶつかる場合**: 脆弱性の修正が公開から 7 日以内だと、Dependabot は PR を出すが、pnpm の版によってはインストールが待ち時間の検査で止まる。安全側に倒れているだけなので、数日待てば通る。待てない事情があるときだけ、その依存を `minimumReleaseAgeExclude` に一時的に足す。

### 公開リポジトリであること

誰でも中身を読め、fork して PR を出せる。そのため次を守る。

- **知らない人の PR を、中身を読まずに手元へ取り込まない。** `pnpm install` や `pnpm verify`、Claude Code の編集後 hook は、リポジトリ内のコードをそのまま実行する。特に `package.json`、`pnpm-lock.yaml`、`scripts/`、`.claude/`、`.github/` の変更は、開いた人の端末や CI で動くコードを変える
- **知らない人の PR を、AI に「確認して」と丸ごと渡さない。** PR の説明文やコードのコメントに AI への指示を仕込む手口がある
- **ワークフローのトリガーを `pull_request_target` に変えない。** fork のコードに書き込み権限と秘密情報が渡る
- **秘密情報をリポジトリに置かない。** 履歴も含めて公開される。今は秘密情報を一切使っていない（公開に必要な権限は GitHub が実行のたびに発行する）
- fork からの PR では CI が読み取り権限だけで動くので、CI 上で勝手に公開や書き換えをされることはない

### pnpm の版

`package.json` の `packageManager` で版とハッシュを固定している。CI は corepack がこの版を入れる。

手元では次のどちらかにする。

- `corepack enable` を実行しておく（Node に付属。固定された版を自動で使う）
- 単体で入れた pnpm を使うなら 11.10 以上に上げておく。10 のままだと、12 への自動切り替えに失敗して次のように止まる

  ```
  ERROR  Failed to switch pnpm to v12.x.x.
  ```

pnpm を上げるときも、公開から 7 日たった版を選ぶ（`corepack use pnpm@<版>` がハッシュごと書き換える）。

pnpm 12 はインストールのたびに、ロックファイルの全依存が待ち時間の決まりを満たすかを確かめる。満たさないと止まる。

### Astro を上げたら手元のビルドが起動しなくなることがある

Astro は小さな更新でも、必要な Node の版を上げることがある。CI は Node 22 の最新を使うので通るが、手元は `.tool-versions` の版のままなので、次のように止まる。

```
Node.js v22.x.x is not supported by Astro!
Please upgrade Node.js to a supported version: ">=22.y.y"
```

`.tool-versions` を表示された版以上に書き換え、その版の Node を入れ直す（mise なら `mise install`）。

## 見送っている道具

- **整形と lint（Biome、Oxlint + Oxfmt、Vite+）**: 2026.11.11 時点で、どれも `.astro` ファイルの扱いが実験的か部分的。このサイトはコードの大半が `.astro` なので、誤検知が AI の作業を誤らせる害のほうが大きい。Biome の対応表から Astro の「実験的」が外れるか、Oxlint がテンプレートの lint に対応したら見直す
  - 確認先: <https://biomejs.dev/internals/language-support/> / <https://oxc.rs/compatibility.html>

## 止まると困る外部のもの

- **ドメイン `sapporochessclub.com`（お名前.com）**: 失効するとサイトもメールの案内も止まる。自動更新の設定と支払い方法の期限を年に一度確かめる
- **GitHub Pages / Pages CMS / Google Analytics / Search Console**: 管理者の権限は [引き継ぎ手順](./ownership-handover.md) を参照

## 経緯を残してある資料

同じ検討をやり直さないために、試して分かったことを残してある。

- [検索順位の経緯](./seo-notes.md)
- [動きの調整の経緯](./motion-notes.md)
- [ヘッダーの設計](./headroom-design.md)
