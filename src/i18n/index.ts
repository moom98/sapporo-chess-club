import ja from "./ja";
import en from "./en";
import { withBase } from "@/lib/utils";

const translations = { ja, en } as const;

export type Locale = keyof typeof translations;

export function t(locale: Locale) {
  return translations[locale];
}

export function getLocalePath(locale: Locale, path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  // 200 を返す正規 URL は末尾スラッシュ付き。無しは GitHub Pages が 301 するので、
  // 内部リンクにリダイレクト元 URL を出さないためここで必ず付ける。
  const slashed = cleanPath.endsWith("/") ? cleanPath : `${cleanPath}/`;
  return withBase(locale === "en" ? `/en${slashed}` : slashed)!;
}

/** getLocalePath の絶対 URL 版。canonical・JSON-LD・llms.txt など origin が要る場所で使う。 */
export function getLocaleUrl(locale: Locale, path: string, site: URL | undefined): string {
  return new URL(getLocalePath(locale, path), site).toString();
}

/** そのロケールの RSS フィードのパス (ファイルなので末尾スラッシュは付かない)。 */
export function getRssPath(locale: Locale): string {
  return withBase(locale === "en" ? "/en/rss.xml" : "/rss.xml")!;
}
