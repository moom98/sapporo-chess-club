import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://sapporochessclub.com",
  base: "/",
  build: {
    // 小さい CSS は <style> としてインライン化し render-blocking を回避
    inlineStylesheets: "always",
  },
  prefetch: {
    // 全リンク prefetch は iOS PWA で rapid navigation した際にリクエストが
    // 積み上がり WebView の接続プール/メモリを圧迫する恐れがある。
    // ナビゲーション上重要なリンクだけ data-astro-prefetch を付けて選択的に行う。
    prefetchAll: false,
    defaultStrategy: "viewport",
  },
  integrations: [sitemap({
    // noindex の一覧・RSS の案内・エラーページを登録しない。過去の記事本文は引き続き登録する。
    filter: (page) => !/\/(?:en\/)?announcements\/archive(?:\/|$)/.test(new URL(page).pathname)
      && !/^\/(?:en\/)?rss\/$/.test(new URL(page).pathname)
      && !/\/404(?:\.html|\/)?$/.test(new URL(page).pathname),
    i18n: { defaultLocale: "ja", locales: { ja: "ja-JP", en: "en-US" } },
  })],
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    locales: ["ja", "en"],
    defaultLocale: "ja",
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
