// npm run data:check — data-quality report for whatever data source is active (JSON or DATABASE_URL). Exit 1 on errors.
// --json for machine output; --strict also fails on warnings.
import { getAllSales, getVenues, getDealRules } from "../src/lib/data";
import { checkData, summarize } from "../src/lib/data-quality";
async function main() {
const [sales, venues, rules] = await Promise.all([getAllSales(), getVenues(), getDealRules()]);
const issues = checkData(sales, venues, rules); const s = summarize(issues);
if (process.argv.includes("--json")) console.log(JSON.stringify({ ...s, issues }, null, 2));
else {
  console.log(`Data check: ${sales.length} sales, ${venues.length} stores, ${rules.length} deal rules → ${s.errors} errors, ${s.warnings} warnings`);
  for (const i of issues) console.log(`${i.level === "error" ? "✖" : "⚠"} [${i.code}] ${i.target}: ${i.msg}`);
}
return (s.errors || (process.argv.includes("--strict") && s.warnings) ? 1 : 0);
}
main().then((code) => process.exit(code));
