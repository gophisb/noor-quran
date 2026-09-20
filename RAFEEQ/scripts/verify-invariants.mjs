// فحص آلي للثوابت القابلة للأتمتة (INV-001, INV-005, INV-009, INV-010)
import { execSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync } from "node:fs";

const results = [];
const run = (cmd) => execSync(cmd, { stdio: "pipe" }).toString();
const check = (id, ok, note = "") => { results.push({ id, ok, note }); console.log(`${ok ? "PASS" : "FAIL"} ${id} ${note}`); };

try { run("npx tsc --noEmit -p . --noUnusedLocals --noUnusedParameters"); check("INV-010", true, "typecheck clean"); } catch (e) { check("INV-010", false, e.stdout?.toString().split("\n")[0]); }
try { run("npm run build"); check("INV-001", true, "build ok"); } catch { check("INV-001", false, "build failed"); }

if (existsSync("dist/index.html")) {
  const html = readFileSync("dist/index.html", "utf8");
  const n = (html.match(/[\u0660-\u0669]/g) || []).length;
  check("INV-005", n === 0, `${n} Arabic-Indic digits in bundle`);
} else check("INV-005", false, "no bundle");

const deps = Object.keys(JSON.parse(readFileSync("package.json", "utf8")).dependencies);
const adrs = readdirSync("RAFEEQ/DECISIONS").map((f) => readFileSync(`RAFEEQ/DECISIONS/${f}`, "utf8")).join("\n");
const undocumented = deps.filter((d) => !["react", "react-dom", "clsx", "tailwind-merge"].includes(d) && !adrs.includes(d));
check("INV-009", undocumented.length === 0, undocumented.length ? `undocumented deps: ${undocumented}` : "all deps have ADR");

const failed = results.filter((r) => !r.ok);
console.log(failed.length ? `RESULT: FAIL (${failed.map((f) => f.id).join(", ")})` : "RESULT: PASS");
process.exit(failed.length ? 1 : 0);
