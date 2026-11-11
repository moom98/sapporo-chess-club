import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { t, getLocaleUrl, getRssPath, type Locale } from "@/i18n";
import { getFaqItems } from "@/lib/faq";

// 補助的な案内。変動する日程は複製せず、常に公式スケジュールへリンクする。
export const GET: APIRoute = async ({ site: origin }) => {
  const [entry] = await getCollection("site");
  const sections = (["ja", "en"] as Locale[]).map((locale) => {
    const i = t(locale);
    const site = entry.data;
    const url = (path: string) => getLocaleUrl(locale, path, origin);
    return [
      `## ${i.site.name}`,
      "",
      i.site.description,
      "",
      i.aiGuide.freshness,
      "",
      `- ${i.clubInfo.venue}: ${site.venue.name[locale]} — ${site.venue.address[locale]}. ${site.venue.access[locale]}`,
      `- ${i.clubInfo.fee}: ${i.clubInfo.general} JPY ${site.fee.general.toLocaleString(locale)} / ${i.clubInfo.students} JPY ${site.fee.student.toLocaleString(locale)}`,
      `- ${i.clubInfo.observation}: ${i.clubInfo.free}`,
      "",
      `### ${i.aiGuide.pages}`,
      "",
      `- [${i.nav.home}](${url("/")})`,
      `- [${i.schedule.pageTitle}](${url("/schedule/")}): ${i.seo.schedule.description}`,
      `- [${i.announcements.pageTitle}](${url("/announcements/")}): ${i.seo.announcementsList.description}`,
      `- [${i.tournament.pageTitle}](${url("/tournaments/")}): ${i.seo.tournaments.description}`,
      `- [${i.contact.label}](${url("/")}#contact)`,
      `- [${i.rss.title}](${new URL(getRssPath(locale), origin)})`,
      "",
      `### ${i.faq.label}`,
      "",
      ...getFaqItems(locale).flatMap((item) => [
        `- [${item.question}](${url("/")}#faq-${item.id}): ${item.answer.replace(/\n/g, " ")}`,
      ]),
    ].join("\n");
  });
  return new Response([
    `# ${t("ja").site.name} / ${t("en").site.name}`,
    "",
    `> ${t("ja").seo.home.description}`,
    "",
    ...sections,
    "",
  ].join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
