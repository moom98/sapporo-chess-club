import { readdir, readFile } from "node:fs/promises";

// 文言ファイルの整合と、コンポーネントへの日本語ベタ書きを検査する。Node だけで動く。
const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const errors = [];

// --- 1. ja.ts / en.ts のキー構造 ---------------------------------------------
// 型 (satisfies Shape<typeof ja>) でも強制しているが、こちらは一瞬で終わるので
// 編集直後の検査に使える。値は見ず、字下げされたキー行だけを比べる。
const keys = async (path) => [...(await read(path)).matchAll(/^\s+(\w+[:(\[])/gm)].map((m) => m[1]).sort();
const ja = await keys("src/i18n/ja.ts");
const en = await keys("src/i18n/en.ts");
const diff = (a, b) => { const rest = [...b]; return a.filter((key) => { const i = rest.indexOf(key); if (i < 0) return true; rest.splice(i, 1); return false; }); };
const onlyJa = diff(ja, en);
const onlyEn = diff(en, ja);
if (onlyJa.length) errors.push(`ja.ts にあって en.ts に無いキー: ${onlyJa.join(" ")}`);
if (onlyEn.length) errors.push(`en.ts にあって ja.ts に無いキー: ${onlyEn.join(" ")}`);

// --- 2. 日本語のベタ書き ------------------------------------------------------
// コメントを除いた残りに日本語の文字があれば、引用符の有無や行の形に関係なく拾う。
// (文字列リテラルだけを見ると <p>本文</p> のような直書きを、class= を含む行を
//  除外すると <p class="…">{"本文"}</p> を見逃す)
async function walk(dir) {
  const entries = await readdir(new URL(dir, root), { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(`${dir}${entry.name}/`) : `${dir}${entry.name}`))).flat();
}
const japanese = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u;
// 行数を保ったままコメントを空白にする。"https://" を行コメントと誤認しないよう : の直後は除く
const stripComments = (code) => code
  .replace(/\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->/g, (comment) => comment.replace(/[^\n]/g, " "))
  .replace(/(?<!:)\/\/.*$/gm, "");
// 意図した直書き。ロゴとして両言語で同じ日本語を出す (h1 に lang="ja" 付き)
const allowed = [{ file: "src/components/Hero.astro", text: "札幌</span><span class=\"block\">チェス</span><span class=\"block\">クラブ" }];
for (const dir of ["src/components/", "src/pages/", "src/layouts/"]) {
  for (const file of (await walk(dir)).filter((path) => /\.(astro|ts)$/.test(path) && !path.endsWith(".d.ts"))) {
    stripComments(await read(file)).split("\n").forEach((line, index) => {
      if (!japanese.test(line)) return;
      if (allowed.some((entry) => entry.file === file && line.includes(entry.text))) return;
      errors.push(`${file}:${index + 1}: 日本語のベタ書き → src/i18n/ja.ts / en.ts へ: ${line.trim().slice(0, 80)}`);
    });
  }
}

if (errors.length) {
  console.error(errors.map((message) => `ERROR: ${message}`).join("\n"));
  process.exit(1);
}
console.log(`i18n checks passed: ${ja.length} keys in ja/en, ベタ書き日本語なし.`);
