import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";

// 掲載内容と生成物 (dist/) の検査。Node だけで動かすこと: python や ripgrep に
// 頼ると、それが無い環境では失敗ではなく「問題なし」として素通りする。
const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const list = async (dir) => (await readdir(new URL(dir, root))).sort();
const errors = [];
const fail = (message) => errors.push(message);

// --- 1. 英訳の欠落 -----------------------------------------------------------
// Pages CMS は ja だけ埋めて en を空のまま保存できる。表示側は ja へ落とすので
// 情報は消えないが、英語版に日本語が出たままになるのを検知する。
// i18n フィールドを増やしたらここの対象にも加える。
const I18N_FIELDS = { "schedule-meetings": ["note"], "schedule-tournaments": ["note", "eventName"] };
for (const [dir, fields] of Object.entries(I18N_FIELDS)) {
  for (const name of (await list(`src/content/${dir}/`)).filter((n) => n.endsWith(".md"))) {
    const text = await read(`src/content/${dir}/${name}`);
    for (const field of fields) {
      // 値が複数行に折り返されていても、字下げが続く限り同じブロックとして読む
      const block = text.match(new RegExp(`^${field}:[ \\t]*\\n((?:[ \\t]+.*\\n?)+)`, "m"))?.[1];
      if (!block) continue;
      const get = (key) => (block.match(new RegExp(`^[ \\t]+${key}:[ \\t]*(.*)$`, "m"))?.[1] ?? "")
        .trim().replace(/^["']+|["']+$/g, "");
      const ja = get("ja");
      const en = get("en");
      if (ja && !en) fail(`${dir}/${name}: ${field}.en が空 (ja: ${ja.slice(0, 30)})`);
      if (en && !ja) fail(`${dir}/${name}: ${field}.ja が空 (en: ${en.slice(0, 30)})`);
    }
  }
}

// --- 2. JSON-LD --------------------------------------------------------------
// 必須項目の欠落を検知する。設立年・更新日・料金など確認できない情報は出さない
// 方針 (docs/ai-search.md) なので、それらは必須にしない。
const jsonLd = (html) => [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  .map((m) => JSON.parse(m[1]));
const missing = (node, keys) => keys.filter((key) => !(key in node));

// スケジュールページは今後の大会だけを Event として出す。今後の大会が 1 件も
// 無い時期は JSON-LD 自体が出ないのが正しいので、元データから期待値を決める。
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(new Date());
const expectEvents = (await list("src/content/schedule-tournaments/"))
  .some((name) => name.endsWith(".md") && name.slice(0, 10) >= today);
const eventCounts = {};
for (const [locale, file] of [["ja", "dist/schedule/index.html"], ["en", "dist/en/schedule/index.html"]]) {
  const events = jsonLd(await read(file)).filter(Array.isArray).flat();
  eventCounts[locale] = events.length;
  if (expectEvents && events.length === 0) fail(`${file}: 今後の大会があるのに Event JSON-LD が無い`);
  for (const event of events) {
    const lack = missing(event, ["name", "startDate", "endDate", "description", "image", "location", "organizer", "eventAttendanceMode", "eventStatus"]);
    if (lack.length) fail(`${file}: Event「${event.name ?? "?"}」に不足: ${lack.join(", ")}`);
  }
  const names = events.map((event) => event.name);
  const dupes = [...new Set(names.filter((name, index) => names.indexOf(name) !== index))];
  if (dupes.length) fail(`${file}: 重複イベント: ${dupes.join(", ")}`);
}
if (eventCounts.ja !== eventCounts.en) fail(`Event の件数が ja (${eventCounts.ja}) と en (${eventCounts.en}) で違う`);

for (const file of ["dist/index.html", "dist/en/index.html"]) {
  const club = jsonLd(await read(file)).find((node) => node["@type"] === "SportsClub");
  if (!club) { fail(`${file}: SportsClub JSON-LD が無い`); continue; }
  const lack = missing(club, ["name", "description", "url", "logo", "address", "sport"]);
  if (lack.length) fail(`${file}: SportsClub に不足: ${lack.join(", ")}`);
}

let articles = 0;
for (const base of ["dist/announcements/", "dist/en/announcements/"]) {
  for (const slug of (await list(base)).filter((name) => name !== "archive" && !name.includes("."))) {
    const file = `${base}${slug}/index.html`;
    const article = jsonLd(await read(file)).find((node) => node["@type"] === "NewsArticle");
    if (!article) { fail(`${file}: NewsArticle JSON-LD が無い`); continue; }
    articles++;
    const lack = missing(article, ["headline", "datePublished", "image", "author", "publisher", "inLanguage", "mainEntityOfPage"]);
    if (lack.length) fail(`${file}: NewsArticle に不足: ${lack.join(", ")}`);
    if (!article.publisher?.logo) fail(`${file}: NewsArticle.publisher.logo が無い`);
  }
}

// --- 3. スケジュールの描画形式 -----------------------------------------------
// 掲載内容に左右されない形式だけを見る。特定の大会名や日付を前提にすると、
// その日程が過ぎた時点で必ず失敗するようになる。
{
  const page = await read("dist/schedule/index.html");
  const visible = page.slice(page.indexOf("<main"), page.indexOf("</main>")).replace(/<script[\s\S]*?<\/script>/g, " ");
  const text = visible.replace(/<[^>]+>/g, " ");
  if (/>\s*中止\s*</.test(visible) && !visible.includes("line-through")) fail("schedule: 中止バッジがあるのにタイトルの取り消し線が無い");
  if (text.includes("※")) fail("schedule: ※ 行が残っている (注意書きは左罫線つきの独立段にする)");
  const noteStyles = new Set([...visible.matchAll(/<p class="([^"]*border-l-2[^"]*)"/g)].map((m) => m[1]));
  if (noteStyles.size > 1) fail(`schedule: 注記行の形式が揃っていない: ${[...noteStyles].join(" / ")}`);
  if (visible.includes("uppercase")) fail("schedule: 月見出しに uppercase が残っている");
  const home = await read("dist/index.html");
  const headings = (home.match(/<h2/g) ?? []).length;
  const sectionHeaders = (home.match(/class="text-xl font-normal/g) ?? []).length;
  if (headings !== sectionHeaders) fail(`TOP: h2 (${headings}) と SectionHeader (${sectionHeaders}) の数が違う。見出しを直書きしていないか`);
}

// --- 4. CSP -----------------------------------------------------------------
// CSP はハッシュ方式 ('unsafe-inline' なし)。ハッシュに無いインラインのスクリプトや
// スタイルは、ブラウザが黙って止める (計測が止まる、動きが消える) ので、ここで突き合わせる。
{
  const sha256 = (text) => `sha256-${createHash("sha256").update(text).digest("base64")}`;
  const htmlFiles = async (dir) => (await Promise.all((await readdir(new URL(dir, root), { withFileTypes: true }))
    .map((entry) => entry.isDirectory() ? htmlFiles(`${dir}${entry.name}/`) : `${dir}${entry.name}`))).flat()
    .filter((path) => path.endsWith(".html"));
  for (const file of await htmlFiles("dist/")) {
    const html = await read(file);
    const csp = html.match(/<meta http-equiv="content-security-policy" content="([^"]*)"/i)?.[1];
    if (!csp) { fail(`${file}: CSP の <meta> が無い`); continue; }
    if (csp.includes("unsafe-inline")) fail(`${file}: CSP に 'unsafe-inline' が入っている`);
    for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (/\bsrc=/.test(attrs) || attrs.includes("application/ld+json")) continue;
      if (!csp.includes(sha256(body))) fail(`${file}: CSP に無いインラインスクリプト: ${body.trim().slice(0, 50)}`);
    }
    for (const [, body] of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)) {
      if (!csp.includes(sha256(body))) fail(`${file}: CSP に無いインラインスタイル: ${body.trim().slice(0, 50)}`);
    }
    const inlineStyle = html.match(/<[a-z][^>]*\sstyle="[^"]*"/i);
    if (inlineStyle) fail(`${file}: style 属性は CSP に止められる (クラスにする): ${inlineStyle[0].slice(-80)}`);
    const handler = html.match(/<[a-z][^>]*\son[a-z]+="/i);
    if (handler) fail(`${file}: on* 属性は CSP に止められる: ${handler[0].slice(-80)}`);
  }
}

if (errors.length) {
  console.error(errors.map((message) => `ERROR: ${message}`).join("\n"));
  process.exit(1);
}
console.log(`Content checks passed: 英訳の欠落なし, Event ${eventCounts.ja} 件, NewsArticle ${articles} 件, SportsClub, スケジュールの形式, CSP のハッシュ.`);
