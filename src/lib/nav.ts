import { t, getLocalePath, type Locale } from "@/i18n";

/**
 * Astro の base path を剥がしてロケール非依存のパスを返す。
 * 例: "/sapporo-chess-club/en/announcements/" → "/en/announcements"
 * 例: "/announcements/" → "/announcements"
 */
export function normalizePath(pathname: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return pathname.replace(new RegExp(`^${base}`), "").replace(/\/$/, "") || "/";
}

/**
 * ロケールプレフィックスを除いた純粋なページパスを返す。
 * 例: "/en/announcements" → "/announcements"
 * 例: "/announcements" → "/announcements"
 */
export function stripLocalePrefix(path: string): string {
  return path.replace(/^\/en/, "") || "/";
}

/**
 * サイト全体で共有するナビゲーションページの定義。
 *
 * Header (デスクトップ top nav) と HamburgerMenu (モバイル全画面メニュー) の
 * 両方から参照される。ページを増やすときはここを 1 箇所だけ編集すれば両方に反映される。
 */

export interface NavPage {
  /** 表示名 (ロケール依存) */
  label: string;
  /** 遷移先 URL (base path 込み) */
  href: string;
  /** aria-current 判定に使う正規化済みパス。例: "/", "/schedule" */
  path: string;
}

export function getNavPages(locale: Locale): NavPage[] {
  const i = t(locale);
  return [
    { label: i.nav.home, href: getLocalePath(locale, "/"), path: "/" },
    { label: i.announcements.label, href: getLocalePath(locale, "/announcements"), path: "/announcements" },
    { label: i.schedule.label, href: getLocalePath(locale, "/schedule"), path: "/schedule" },
    { label: i.nav.tournaments, href: getLocalePath(locale, "/tournaments"), path: "/tournaments" },
  ];
}

/** Header の top nav で表示するページ (home を除く) */
export function getTopNavPages(locale: Locale): NavPage[] {
  return getNavPages(locale).filter((p) => p.path !== "/");
}
