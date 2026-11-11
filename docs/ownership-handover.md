# サイト管理の引き継ぎ

対象サイト: <https://sapporochessclub.com/>  
移譲先の GitHub アカウント: `moom98`

## 引き継ぎの順序

1. 新管理者が GitHub の移譲確認メールを開き、`moom98` で承認する。確認メールの期限は 1 日。
2. 新しいリポジトリ <https://github.com/moom98/sapporo-chess-club> が開けることを確認する。
3. リポジトリの Settings → Pages で、公開元が GitHub Actions、Custom domain が `sapporochessclub.com`、HTTPS が有効であることを確認する。
4. お名前.com の DNS 設定で、`www` の CNAME を旧所有者の `kuramoto-to-the-moon.github.io` から `moom98.github.io` に変更する。ルートドメインの GitHub Pages 向け A レコードは維持する。
5. 新管理者が GitHub で Pages CMS にログインし、対象リポジトリへの GitHub App のアクセスを確認・必要に応じて設定する。
6. 移譲後の CMS <https://app.pagescms.org/moom98/sapporo-chess-club/main> でコンテンツが表示されることを確認する。既存の共同編集者のアクセスも確認する。
7. README と運用ガイドの CMS リンクを新しい URL に更新する。ローカル開発環境の接続先も更新する。

   ```bash
   git remote set-url origin git@github.com:moom98/sapporo-chess-club.git
   ```

8. Actions → Deploy to GitHub Pages → Run workflow から `main` を公開し、成功を確認する。毎日 15:00 UTC（翌日 00:00 JST）の定期実行も有効であることを確認する。
9. 日本語・英語ページ、独自ドメインの HTTPS、`www` からの転送を確認する。次回の実際の CMS 更新でも本番へ反映されることを確認する。
10. 新管理者が自分のアカウントで `.github/workflows/deploy.yml` の `cron` の行を一度編集してコミットする（時刻は変えず、コメントを足すだけでよい）。夜間の再ビルドが失敗したときの通知は、この行を最後に変更した人に届くため。

## Google の管理権限

- Google Analytics: 対象プロパティ `sapporochessclub.com`（測定 ID `G-5CX3KE8FFP`）で新管理者に管理者権限があることを確認する。既存プロパティを引き継ぎ、計測履歴を維持する。
- Search Console: ドメインプロパティ `sapporochessclub.com` に新管理者をオーナーとして追加する。
- 旧管理者から独立して運用できるよう、新管理者自身でも Search Console の所有権確認を行う。ドメインプロパティの場合は、新管理者の画面で発行された DNS の TXT レコードをお名前.com に登録する。
- Bing Webmaster Tools などを利用している場合は、それぞれの管理権限も確認する。

## 完了条件

- 新管理者が GitHub の所有者として設定を管理できる。
- 新管理者が CMS で編集でき、GitHub Actions から公開できる。
- サイトと `www` の HTTPS アクセスが正常に動作する。
- 日次の定期公開が有効になっている。失敗時の通知が新管理者に届く（手順 10）。
- ドメインの更新・支払いと DNS 管理を新管理者が行える。
- Google Analytics と Search Console を新管理者が管理できる。

旧管理者のアクセスを外す場合は、上記を確認してから行う。GitHub の個人アカウント間の移譲では、旧所有者は共同編集者として残る。

日々の更新手順は [運用ガイド](./operations.md)、引き継いだ後に知っておくこと（定期実行の自動停止、依存の更新、ドメイン）は [保守の注意](./maintenance.md) を参照。

## 参考

- [GitHub: リポジトリの移譲](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository)
- [GitHub: カスタムドメインの管理](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [Google: Search Console のユーザーと権限](https://support.google.com/webmasters/answer/7687615?hl=ja)
