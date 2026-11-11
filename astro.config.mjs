import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

// <head> のインラインスクリプトは Astro が加工しない (is:inline) ので、ハッシュも
// 自動では付かない。BaseLayout が埋め込むのと同じファイルから計算して CSP に渡す。
const inlineScriptHashes = ["head-motion.js", "head-analytics.js"].map((name) => {
  const code = readFileSync(new URL(`./src/scripts/${name}`, import.meta.url));
  return `sha256-${createHash("sha256").update(code).digest("base64")}`;
});

export default defineConfig({
  site: "https://sapporochessclub.com",
  base: "/",
  build: {
    // 小さい CSS は <style> としてインライン化し render-blocking を回避
    inlineStylesheets: "always",
  },
  security: {
    // GitHub Pages は HTTP ヘッダーを付けられないので <meta> で出す。
    // script-src / style-src は Astro がビルド時にハッシュを計算して埋める
    // ('unsafe-inline' を使わない)。
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com",
        "font-src 'self'",
        "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "manifest-src 'self'",
      ],
      scriptDirective: {
        resources: ["'self'", "https://www.googletagmanager.com"],
        hashes: inlineScriptHashes,
      },
    },
  },
  prefetch: {
    // 全リンク prefetch は iOS PWA で rapid navigation した際にリクエストが
    // 積み上がり WebView の接続プール/メモリを圧迫する恐れがある。
    // ナビゲーション上重要なリンクだけ data-astro-prefetch を付けて選択的に行う。
    prefetchAll: false,
    defaultStrategy: "viewport",
  },
  integrations: [sitemap({
    // noindex の一覧とエラーページを登録しない。過去の記事本文は引き続き登録する。
    filter: (page) => !/\/(?:en\/)?announcements\/archive(?:\/|$)/.test(new URL(page).pathname)
      && !/\/404(?:\.html|\/)?$/.test(new URL(page).pathname),
    i18n: { defaultLocale: "ja", locales: { ja: "ja-JP", en: "en-US" } },
  })],
  markdown: {
    // Shiki はインライン style で色を付けるので CSP に止められる。お知らせに
    // コードブロックは無いので強調表示ごと切っておく。
    syntaxHighlight: false,
  },
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
