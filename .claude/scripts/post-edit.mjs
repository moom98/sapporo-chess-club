import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

// Claude Code の PostToolUse hook。編集されたファイルに応じた検査を走らせる。
// 失敗は stderr + exit 2 で返すこと: それ以外の終了コードや stdout は AI に届かず、
// 検査が落ちても誰も気づかない。Node 以外の道具に頼らないのも同じ理由。
const root = fileURLToPath(new URL("../../", import.meta.url));
const report = (message) => { process.stderr.write(`${message}\n`); process.exit(2); };

let file;
try {
  file = JSON.parse(readFileSync(0, "utf8")).tool_input?.file_path;
} catch {
  report("post-edit hook: 入力を読めませんでした。検査は走っていません");
}
if (!file) process.exit(0);
const path = relative(root, file).split(sep).join("/");

// シェルの既定 Node が古いと astro が起動しないので、mise があれば .tool-versions の版で走らせる
const shell = process.platform === "win32";
const mise = spawnSync("mise", ["--version"], { shell }).status === 0;
function run(command, ...args) {
  const [cmd, argv] = mise ? ["mise", ["exec", "--", command, ...args]] : [command, args];
  const result = spawnSync(cmd, argv, { cwd: root, encoding: "utf8", shell });
  if (result.status !== 0) {
    const output = `${result.stdout ?? ""}${result.stderr ?? ""}${result.error?.message ?? ""}`;
    report(`${command} ${args.join(" ")} が失敗:\n${output.trim().split("\n").slice(-25).join("\n")}`);
  }
}

const build = () => run("pnpm", "build");
const content = () => run("node", "scripts/check-content.mjs");
const merge = () => run("node", "scripts/check-schedule-merge.mjs");
const i18n = () => run("node", "scripts/check-i18n.mjs");

if (path === "src/content.config.ts" || path === ".pages.yml") build();
else if (path.startsWith("src/content/")) { build(); content(); }
else if (path === "src/i18n/ja.ts" || path === "src/i18n/en.ts") i18n();
else if (path === "src/lib/schedule.ts" || path.startsWith("src/components/Schedule")) { i18n(); merge(); build(); content(); }
else if (path === "src/lib/jsonld.ts" || path === "src/lib/breadcrumb.ts") { build(); content(); }
else if (/^src\/(components|pages|layouts)\//.test(path)) i18n();
