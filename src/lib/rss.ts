import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { t, getLocalePath, type Locale } from "@/i18n";
import { parseDate } from "@/lib/date";
import { withBase } from "@/lib/utils";
import { getSortedAnnouncements, pickTitle, pickDescription } from "@/lib/announcement";

/** /rss.xml と /en/rss.xml から共有して使う RSS フィードの実装。 */
export async function buildRssFeed(locale: Locale, context: APIContext) {
  const i = t(locale);
  const items = await getSortedAnnouncements();
  return rss({
    title: i.rss.title,
    description: i.rss.description,
    site: new URL(import.meta.env.BASE_URL, context.site!).toString(),
    // ブラウザで開いた時に人間向けページとして見えるよう XSLT を適用。
    // RSS リーダーには引き続き生 XML が配信される。
    stylesheet: withBase(locale === "en" ? "/rss-styles-en.xsl" : "/rss-styles.xsl")!,
    items: items.map((item) => ({
      title: pickTitle(item, locale),
      description: pickDescription(item, locale),
      pubDate: parseDate(item.data.date),
      link: getLocalePath(locale, `/announcements/${item.id}`),
    })),
  });
}
