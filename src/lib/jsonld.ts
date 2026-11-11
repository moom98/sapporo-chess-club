import type { CollectionEntry } from "astro:content";
import { t, getLocaleUrl, type Locale } from "@/i18n";
import { getEventName, groupScheduleDates, type ScheduleDate } from "@/lib/schedule";

const SITE_URL = "https://sapporochessclub.com/";
const CLUB_ID = `${SITE_URL}#club`;
const WEBSITE_ID = `${SITE_URL}#website`;

/** HTML 内の script 終端として解釈されないようにする。 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

type SiteData = CollectionEntry<"site">["data"];

const languageTag = (locale: Locale) => (locale === "ja" ? "ja-JP" : "en-US");

/** Event の主催者・記事の著者/発行者として参照するクラブ本体。 */
function clubRef(locale: Locale) {
  return {
    "@type": "SportsClub",
    "@id": CLUB_ID,
    name: t(locale).site.name,
    url: SITE_URL,
  };
}

function venuePostalAddress(locale: Locale, site: SiteData) {
  return {
    "@type": "PostalAddress",
    streetAddress: site.venue.address[locale],
    addressLocality: "Sapporo",
    addressRegion: "Hokkaido",
    addressCountry: "JP",
  };
}

/**
 * WebSite JSON-LD: Google 検索結果の「サイト名」表示に使われる。
 * https://developers.google.com/search/docs/appearance/site-names
 * これがないと検索結果がドメイン名（sapporochessclub.com）のまま表示されがち。
 */
export function buildWebsiteJsonLd(locale: Locale): string {
  const i = t(locale);
  return serializeJsonLd({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    publisher: { "@id": CLUB_ID },
    name: i.site.name,
    alternateName: i.site.alternateName,
    url: SITE_URL,
    inLanguage: languageTag(locale),
  });
}

/** SportsClub JSON-LD: クラブ本体の構造化データ（TOP ページ用）。 */
export function buildClubJsonLd(locale: Locale, site: SiteData, astroSite: URL | undefined): string {
  const i = t(locale);
  const clubLogoUrl = new URL("/icon-512.png", astroSite).toString();
  const clubImageUrl = new URL("/images/og.webp", astroSite).toString();
  return serializeJsonLd({
    "@context": "https://schema.org",
    "@type": "SportsClub",
    "@id": CLUB_ID,
    name: i.site.name,
    alternateName: i.site.alternateName,
    description: i.site.description,
    url: SITE_URL,
    logo: clubLogoUrl,
    image: clubImageUrl,
    sport: "Chess",
    // 本文で確認できるのは「1990年代」。設立年を推測して出力しない。
    sameAs: ["https://x.com/SapporoChess"],
    ...(site.email && { email: site.email }),
    address: venuePostalAddress(locale, site),
    // geo / areaServed: 「near me」検索や Knowledge Panel の地図表示精度を上げる。
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.venue.geo.latitude,
      longitude: site.venue.geo.longitude,
    },
    areaServed: [
      { "@type": "City", name: "Sapporo" },
      { "@type": "AdministrativeArea", name: "Hokkaido" },
    ],
    location: {
      "@type": "Place",
      name: site.venue.name[locale],
      address: site.venue.address[locale],
      geo: {
        "@type": "GeoCoordinates",
        latitude: site.venue.geo.latitude,
        longitude: site.venue.geo.longitude,
      },
    },
  });
}

/**
 * 大会を Event としてマークアップ（過去含む、スケジュールページ用）。
 * 連続日の同一大会は groupScheduleDates で 1 イベントにまとめる（表示側と同じ規則）。
 * startDate = 初日の開始時刻, endDate = 最終日の終了時刻。
 * 大会が 1 件もなければ null。
 */
export function buildEventsJsonLd(
  locale: Locale,
  tournaments: ScheduleDate[],
  site: SiteData,
  astroSite: URL | undefined,
): string | null {
  const ogImage = new URL("/images/og.webp", astroSite).toString();

  const groups = groupScheduleDates(tournaments);
  if (groups.length === 0) return null;

  return serializeJsonLd(groups.map((group) => {
    const first = group[0];
    const last = group[group.length - 1];
    const name = getEventName(first, locale);
    // groupScheduleDates は cancelled をキーに含めるのでグループ内で必ず一致する
    const cancelled = first.cancelled === true;

    return {
      "@context": "https://schema.org",
      "@type": "Event",
      name,
      ...(first.announcementSlug && {
        url: getLocaleUrl(locale, `/announcements/${first.announcementSlug}/`, astroSite),
      }),
      startDate: first.startTime ? `${first.date}T${first.startTime}:00+09:00` : first.date,
      endDate: last.endTime ? `${last.date}T${last.endTime}:00+09:00` : last.date,
      description: `${name} — ${site.venue.name[locale]}`,
      image: ogImage,
      location: {
        "@type": "Place",
        name: site.venue.name[locale],
        address: venuePostalAddress(locale, site),
      },
      organizer: clubRef(locale),
      // 大会別の料金・受付開始・空席は未管理。例会料金や推定値を流用しない。
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: cancelled
        ? "https://schema.org/EventCancelled"
        : "https://schema.org/EventScheduled",
    };
  }));
}

/**
 * NewsArticle JSON-LD: お知らせをニュース記事としてマークアップ。
 * inLanguage と isAccessibleForFree を明示することで多言語サイトとしての
 * 理解を助け、rich result 適格性を上げる。
 */
export function buildNewsArticleJsonLd(args: {
  locale: Locale;
  contentLocale?: Locale;
  title: string;
  description: string;
  /** frontmatter の date ("YYYY-MM-DD") */
  date: string;
  canonicalUrl: string;
  astroSite: URL | undefined;
}): string {
  const { locale, contentLocale = locale, title, description, date, canonicalUrl, astroSite } = args;
  const ogImage = new URL("/images/og.webp", astroSite).toString();
  const datePublishedIso = `${date}T00:00:00+09:00`;
  return serializeJsonLd({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${canonicalUrl}#article`,
    headline: title,
    description,
    datePublished: datePublishedIso,
    // 更新日を管理していないため、公開日を更新日と見なさない。
    inLanguage: languageTag(contentLocale),
    isAccessibleForFree: true,
    image: [ogImage],
    url: canonicalUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    author: clubRef(locale),
    publisher: {
      ...clubRef(locale),
      logo: {
        "@type": "ImageObject",
        url: new URL("/icon-512.png", astroSite).toString(),
      },
    },
  });
}
