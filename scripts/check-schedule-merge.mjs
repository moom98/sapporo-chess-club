import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

// groupScheduleDates の結合規則を合成データで検証する。結合するのは次を全て満たすときだけ:
//   1. どちらも大会 (例会は表示名が全て同じなので結合してはいけない)
//   2. eventName が入力済みで一致 (未入力はフォールバックで同名判定される)
//   3. 日付が連続
//   4. cancelled の状態が一致 (中止日と開催日を 1 行にまとめない)
//
// schedule.ts は @/ エイリアスを使うので、import だけ差し替えて一時ディレクトリへ
// 変換する。Node の型ストリップではなく typescript で変換するのは、Node の版に
// 左右されずに動かすため。
const root = new URL("../", import.meta.url);
const tmp = await mkdtemp(join(tmpdir(), "schedule-merge-"));
const transpile = async (source, target, rewrite = (code) => code) => {
  const code = rewrite(await readFile(new URL(source, root), "utf8"));
  const { outputText } = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  await writeFile(join(tmp, target), outputText);
};

try {
  await writeFile(join(tmp, "i18n.mjs"), "export function t() { return {}; }\n");
  await transpile("src/lib/date.ts", "date.mjs");
  await transpile("src/lib/schedule.ts", "schedule.mjs", (code) => code
    .replace('from "@/i18n"', 'from "./i18n.mjs"')
    .replace('from "@/lib/date"', 'from "./date.mjs"'));
  const { groupScheduleDates } = await import(pathToFileURL(join(tmp, "schedule.mjs")).href);

  const day = (date, over = {}) => ({
    date, startTime: "09:00", endTime: "16:00", room: "1010",
    type: "tournament", eventName: { ja: "大会A", en: "A" }, ...over,
  });
  const meeting = (date) => day(date, { type: "meeting", eventName: undefined });
  const shape = (dates) => groupScheduleDates(dates).map((group) => group.map((d) => d.date));

  const cases = [
    ["連続日の同一大会は結合される",
      [day("2026-10-11"), day("2026-10-12")],
      [["2026-10-11", "2026-10-12"]]],
    ["両日中止は結合される",
      [day("2026-10-11", { cancelled: true }), day("2026-10-12", { cancelled: true })],
      [["2026-10-11", "2026-10-12"]]],
    ["中止状態が違えば結合しない",
      [day("2026-10-11", { cancelled: true }), day("2026-10-12")],
      [["2026-10-11"], ["2026-10-12"]]],
    ["連続していなければ結合しない",
      [day("2026-10-11"), day("2026-10-13")],
      [["2026-10-11"], ["2026-10-13"]]],
    ["eventName 未入力は結合しない (フォールバック名での誤結合を防ぐ)",
      [day("2026-10-11", { eventName: undefined }), day("2026-10-12", { eventName: undefined })],
      [["2026-10-11"], ["2026-10-12"]]],
    ["例会は結合しない (表示名が全て同じになるため)",
      [meeting("2026-10-11"), meeting("2026-10-12")],
      [["2026-10-11"], ["2026-10-12"]]],
    ["例会が間に挟まっても大会は結合される (隣接ではなくキーで引くため)",
      [meeting("2026-10-11"), day("2026-10-11"), meeting("2026-10-12"), day("2026-10-12")],
      [["2026-10-11"], ["2026-10-11", "2026-10-12"], ["2026-10-12"]]],
    ["名前が違えば結合しない",
      [day("2026-10-11"), day("2026-10-12", { eventName: { ja: "大会B", en: "B" } })],
      [["2026-10-11"], ["2026-10-12"]]],
    ["月をまたぐ連続日も結合される",
      [day("2026-10-31"), day("2026-11-01")],
      [["2026-10-31", "2026-11-01"]]],
  ];
  for (const [label, input, expected] of cases) assert.deepEqual(shape(input), expected, label);
  console.log(`Schedule merge checks passed: ${cases.length} cases.`);
} finally {
  await rm(tmp, { recursive: true, force: true });
}
