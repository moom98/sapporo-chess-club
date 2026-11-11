import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import type { Locale } from "@/i18n";
import { parseDate, getDateParts, formatMonthDay, startOfTodayJST } from "@/lib/date";

export type Announcement = CollectionEntry<"announcements">;

const ARCHIVE_AFTER_DAYS = 365;

/**
 * 全 announcement を新しい順 (date desc) で返す。
 * Astro frontmatter (server-only) 専用。
 */
export async function getSortedAnnouncements(): Promise<Announcement[]> {
  const all = await getCollection("announcements");
  return all.sort(
    (a, b) => parseDate(b.data.date).getTime() - parseDate(a.data.date).getTime()
  );
}

/** ビルド時点の JST 今日から ARCHIVE_AFTER_DAYS 日前を境界として返す。 */
function getArchiveCutoff(): Date {
  const today = startOfTodayJST();
  return new Date(today.getTime() - ARCHIVE_AFTER_DAYS * 24 * 60 * 60 * 1000);
}

/** 直近 365 日以内に公開されたお知らせ (新しい順)。 */
export async function getActiveAnnouncements(): Promise<Announcement[]> {
  const all = await getSortedAnnouncements();
  const cutoff = getArchiveCutoff();
  return all.filter((e) => parseDate(e.data.date) >= cutoff);
}

/** 365 日より前に公開されたお知らせ (新しい順)。アーカイブページ用。 */
export async function getArchivedAnnouncements(): Promise<Announcement[]> {
  const all = await getSortedAnnouncements();
  const cutoff = getArchiveCutoff();
  return all.filter((e) => parseDate(e.data.date) < cutoff);
}

/**
 * アーカイブに含まれる年の一覧を新しい順で返す。
 * `/announcements/archive/[year]` の getStaticPaths から使う。
 */
async function getArchivedYears(): Promise<number[]> {
  const archived = await getArchivedAnnouncements();
  return Array.from(groupByYear(archived).keys()).sort((a, b) => b - a);
}

/**
 * エントリを公開年でグルーピングする。各年の配列内は入力順を維持するため、
 * 呼び出し側で事前にソート (date desc など) しておくと年内も降順になる。
 */
export function groupByYear(entries: Announcement[]): Map<number, Announcement[]> {
  const map = new Map<number, Announcement[]>();
  for (const entry of entries) {
    const { year } = getDateParts(entry.data.date);
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(entry);
  }
  return map;
}

export function pickTitle(entry: Announcement, locale: Locale): string {
  return locale === "ja"
    ? entry.data.title.ja
    : (entry.data.title.en ?? entry.data.title.ja);
}

/**
 * 本文 (markdown body) から概要テキストを自動生成する。
 * CMS で概要を手書きさせるのは二度手間なので、本文の先頭を切り出して使う。
 * UI 側は CSS line-clamp でクリップ、RSS は maxLen で切る。
 */
export function pickDescription(entry: Announcement, locale: Locale, maxLen = 200): string {
  // 既存の手書き description があればそちらを優先 (後方互換)
  if (locale === "ja" && entry.data.description?.ja) return entry.data.description.ja;
  if (locale === "en" && entry.data.description?.en) return entry.data.description.en;
  if (locale === "en" && entry.data.description?.ja) return entry.data.description.ja;

  // 本文から自動抽出
  const raw = locale === "en" && entry.data.bodyEn
    ? entry.data.bodyEn
    : (entry.body ?? "");
  const plain = stripMarkdown(raw);
  // 画像のみの告知でも空の description を出さない。
  if (!plain) return pickTitle(entry, locale);
  return plain.length > maxLen ? plain.slice(0, maxLen) + "..." : plain;
}

/** Markdown 記法を除去してプレーンテキストにする */
function stripMarkdown(md: string): string {
  return md
    .replace(/<[^>]*>/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]*)\]\(.*?\)/g, "$1")
    .replace(/(\*{1,3}|_{1,3})(.*?)\1/g, "$2")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^\|.*$/gm, "")
    .replace(/^---+$/gm, "")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/\n{2,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** en サイトで未翻訳エントリかどうか判定 (en === undefined) */
export function hasJaOnlyContent(entry: Announcement): boolean {
  return !entry.data.title.en;
}

/** "2026-04-12" -> "2026.04.12" */
export function formatAnnouncementDate(dateStr: string): string {
  const { year } = getDateParts(dateStr);
  return `${year}.${formatMonthDay(dateStr)}`;
}

/**
 * 大会の開催日表記。単日なら "2026.07.19"、複数日はレンジ表示。
 * 同月なら終了は日のみ ("2026.07.19–20")、月跨ぎは月日 ("2026.07.31–08.01")、
 * 年跨ぎは年から ("2025.12.31–2026.01.01")。区切りは en dash。
 */
export function formatTournamentDate(date: string, endDate?: string): string {
  const start = formatAnnouncementDate(date);
  if (!endDate || endDate === date) return start;
  const s = getDateParts(date);
  const e = getDateParts(endDate);
  if (e.year !== s.year) return `${start}–${formatAnnouncementDate(endDate)}`;
  if (e.month !== s.month) return `${start}–${formatMonthDay(endDate)}`;
  return `${start}–${String(e.day).padStart(2, "0")}`;
}

/**
 * /announcements/[slug] ja/en route から共有して使う getStaticPaths 実装。
 * `prev` は古い側、`next` は新しい側 (sort が desc なので index が大 = 古い)。
 */
export async function getAnnouncementStaticPaths() {
  const all = await getSortedAnnouncements();
  return all.map((entry, idx) => ({
    params: { slug: entry.id },
    props: {
      entry,
      prev: all[idx + 1] ?? null,
      next: all[idx - 1] ?? null,
    },
  }));
}

/** /announcements/archive/[year] ja/en route から共有して使う getStaticPaths 実装。 */
export async function getArchiveYearStaticPaths() {
  const years = await getArchivedYears();
  return years.map((year) => ({
    params: { year: String(year) },
    props: { year },
  }));
}
