/**
 * 札幌チェスクラブ = 日本時間 (JST, UTC+9) を基準に日付を扱う。
 *
 * デフォルトの new Date("2026-04-15") は UTC 真夜中扱いになり、米州ユーザーが
 * 見ると 1 日前にズレてしまうため、明示的に JST のカレンダー日として解釈する。
 */

const JST_OFFSET = "+09:00";

/** en-CA は "YYYY-MM-DD" で出力される。JST のカレンダー日を文字列で得るのに使う。 */
const jstYmd = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * CMS の date 文字列を JST のカレンダー日として Date オブジェクトに変換する。
 * - "2026-04-15" のような date-only 形式 → JST 真夜中 (= 同日 15:00 UTC)
 * - "2026-04-15T18:30:00+09:00" のような完全な ISO 形式 → そのまま尊重
 */
export function parseDate(s: string): Date {
  if (/T|Z|[+-]\d{2}:?\d{2}$/.test(s)) return new Date(s);
  return new Date(`${s}T00:00:00${JST_OFFSET}`);
}

/**
 * 「今日の JST 0:00」を表す Date を返す。フィルタリングの基準として使う。
 * 例: 2026-04-15 14:00 JST に呼ぶと 2026-04-15 00:00 JST が返る。
 */
export function startOfTodayJST(): Date {
  return new Date(`${jstYmd.format(new Date())}T00:00:00${JST_OFFSET}`);
}

/**
 * "2026-04-15" のような date 文字列から曜日を返す。
 * JST のカレンダー日として解釈し、locale に応じた曜日表記を返す。
 * 既定は短縮形 (日 / Sun)。width="long" は 日曜日 / Sunday。
 */
export function getDayOfWeek(s: string, locale: "ja" | "en", width: "short" | "long" = "short"): string {
  const fmt = new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", {
    timeZone: "Asia/Tokyo",
    weekday: width,
  });
  return fmt.format(parseDate(s));
}

/**
 * サイト共通の月日表記: "2026-07-19" -> "07.19"（0埋め・ドット区切り）。
 * 年付きは lib/announcement.ts の formatAnnouncementDate ("2026.07.19") を使う。
 */
export function formatMonthDay(s: string): string {
  const { month, day } = getDateParts(s);
  return `${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
}

/**
 * "2026-04-15" のような date-only 文字列から年/月/日 を取り出す。
 * Date オブジェクトを介さないのでタイムゾーンの影響を受けない。
 * 完全な ISO の場合は parseDate 経由で JST 換算した日付を返す。
 */
export function getDateParts(s: string): { year: number; month: number; day: number } {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(s);
  if (dateOnly) {
    const [year, month, day] = s.split("-").map(Number);
    return { year, month, day };
  }
  const [year, month, day] = jstYmd.format(parseDate(s)).split("-").map(Number);
  return { year, month, day };
}
