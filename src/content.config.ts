import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

// =============================================================================
// YAML + CMS 互換ヘルパー
//
// Pages CMS + YAML パーサーは以下の変換を行うため、Zod スキーマ側で
// 全パターンを吸収する必要がある:
//
//   YAML 入力        → JS の型        → 対策
//   field:           → null           → .nullable() で受けて undefined/デフォルト化
//   field: ""        → ""             → transform で undefined 化
//   field: null      → null           → .nullable() で受けて undefined 化
//   field: 2026-03-16→ Date object    → dateString で string 化
//   field: 740       → number         → yamlString で String() 化
//   field: yes       → boolean true   → yamlString で String() 化
// =============================================================================

/**
 * 必須の date フィールド。string / Date を YYYY-MM-DD に正規化。
 * null が来たら Zod バリデーションエラーになる (= ビルド失敗で気づける)。
 */
const requiredDate = z.string().or(z.date())
  .transform((v) => v instanceof Date ? v.toISOString().split("T")[0] : v);

/**
 * 任意の date フィールド。空文字列 / null は undefined 化。
 * 複数日大会の終了日など、あるときだけ設定される日付に使う。
 */
const optionalDate = z.string().or(z.date()).nullable().optional()
  .transform((v) => {
    if (v === null || v === undefined || v === "") return undefined;
    return v instanceof Date ? v.toISOString().split("T")[0] : v;
  });

/**
 * YAML の型自動変換に対応する文字列フィールド。
 * 数値 (740) / 真偽値 (yes) / null を全て文字列に変換。
 */
const yamlString = z.string().or(z.number()).or(z.boolean()).nullable()
  .transform((v) => (v === null || v === undefined) ? "" : String(v));

/**
 * 時刻フィールド。"9:00" → "09:00" のようにゼロ埋めして HH:MM に正規化。
 */
const timeString = z.string().or(z.number()).or(z.boolean()).nullable()
  .transform((v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    const m = s.match(/^(\d{1,2}):(\d{2})$/);
    if (m) return `${m[1].padStart(2, "0")}:${m[2]}`;
    return s;
  });

/**
 * nullable + 空文字列 → undefined にする文字列。optional フォールバックを確実に効かせる。
 */
const nullableString = z.string().nullable().optional()
  .transform((v) => (v === null || v === undefined || v === "") ? undefined : v);

/**
 * YAML の真偽値フィールド。CMS でチェックボックス未設定 (null/undefined) は false 扱い。
 */
/**
 * 外部サイトへのリンク。href にそのまま出るので http(s) 以外 (javascript: 等) は
 * ビルドを失敗させて弾く。
 */
const isHttpUrl = (v: string | undefined) => v === undefined || /^https?:\/\//.test(v);
const httpUrlMessage = { message: "http:// または https:// で始まる URL を入力してください" };
const requiredHttpUrl = z.string().refine(isHttpUrl, httpUrlMessage);
const optionalHttpUrl = nullableString.refine(isHttpUrl, httpUrlMessage);

const yamlBoolean = z.boolean().nullable().optional()
  .transform((v) => v === true);

/**
 * ja/en の i18n オブジェクト。null / 空文字列 / 空オブジェクトを全て undefined に。
 * CMS が { ja: null, en: null } や { ja: "", en: "" } で保存するケースに対応。
 */
const i18nString = z.string().nullable().transform((v) => v ?? "");
const optionalI18nString = i18nString.optional().transform((v) => v ?? "");
const optionalI18n = z.object({ ja: i18nString, en: optionalI18nString })
  .nullable()
  .optional()
  .transform((v) => {
    if (!v) return undefined;
    if (!v.ja && !v.en) return undefined;
    return v;
  });

/** ja・en とも必須の i18n オブジェクト。表示側は [locale] で直接参照してよい。 */
const requiredI18n = z.object({ ja: z.string(), en: z.string() });

// =============================================================================
// コレクション定義
// =============================================================================

/** 例会の個別ファイル (1 日程 = 1 YAML) */
const scheduleMeetings = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/schedule-meetings" }),
  schema: z.object({
    date: requiredDate,
    startTime: timeString,
    endTime: timeString,
    room: yamlString,
    note: optionalI18n,
    cancelled: yamlBoolean,
  }),
});

/** 大会の個別ファイル (1 日程 = 1 YAML) */
const scheduleTournaments = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/schedule-tournaments" }),
  schema: z.object({
    date: requiredDate,
    eventName: optionalI18n,
    startTime: timeString,
    endTime: timeString,
    room: yamlString,
    note: optionalI18n,
    announcement: nullableString,
    cancelled: yamlBoolean,
    chessResults: optionalHttpUrl,
  }),
});

const tournaments = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/tournaments" }),
  schema: z.object({
    title: z.object({
      ja: z.string(),
      en: nullableString,
    }),
    date: requiredDate,
    endDate: optionalDate,
    detailsPdf: nullableString,
    resultsPdf: nullableString,
    gamesPgn: nullableString,
    gamesPgnAnnotated: nullableString,
    chessResults: optionalHttpUrl,
  }),
});

const lessons = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/lessons" }),
  schema: z.object({
    title: requiredI18n,
    description: requiredI18n,
    url: optionalHttpUrl,
  }),
});

const links = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/links" }),
  schema: z.object({
    links: z.array(
      z.object({
        title: requiredI18n,
        url: requiredHttpUrl,
      })
    ),
  }),
});

const site = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/site" }),
  schema: z.object({
    email: z.string(),
    venue: z.object({
      name: requiredI18n,
      address: requiredI18n,
      access: requiredI18n,
      geo: z.object({
        latitude: z.coerce.number(),
        longitude: z.coerce.number(),
      }),
    }),
    fee: z.object({
      general: z.coerce.number(),
      student: z.coerce.number(),
    }),
  }),
});

const announcements = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/announcements" }),
  schema: z.object({
    title: z.object({
      ja: z.string(),
      en: nullableString,
    }),
    description: z.object({
      ja: i18nString,
      en: nullableString,
    }).nullable().optional(),
    date: requiredDate,
    bodyEn: nullableString,
  }),
});

export const collections = { scheduleMeetings, scheduleTournaments, tournaments, lessons, links, site, announcements };
