// Admin UI smoke (server-action login → unpublish/republish → logout) against a scratch-data `next start`. Needs Playwright (not a repo dep):
// cd /tmp/pw && node /workspace/thriftradarfl/scripts/sweep-admin-ui.mjs   (B=… ADMIN_PASSWORD=… to override)
import { chromium } from "playwright";
const B = process.env.B ?? "http://localhost:3100"; const PW = process.env.ADMIN_PASSWORD ?? "sweep-pw"; const b = await chromium.launch(); const pg = await (await b.newContext()).newPage(); const out = [];
pg.on("dialog", (d) => d.accept());
await pg.goto(B + "/admin"); await pg.fill('input[name="password"]', "wrong"); await pg.press('input[name="password"]', 'Enter'); await pg.waitForLoadState("networkidle");
out.push("wrong pw still login: " + (await pg.locator('input[name="password"]').count() > 0));
await pg.fill('input[name="password"]', PW); await pg.press('input[name="password"]', 'Enter'); await pg.getByText("Log out").waitFor({ timeout: 10000 }).catch(() => {});
out.push("logged in: " + (await pg.getByText("Log out").count() > 0));
const before = await pg.locator("text=unpublish").count(); const t = pg.locator("button", { hasText: /^unpublish$/i }).first();
if (await t.count()) { await t.click(); await pg.waitForTimeout(2500); out.push(`unpublish clicked; publish buttons now ${await pg.locator("button", { hasText: /^publish$/i }).count()}`);
  await pg.locator("button", { hasText: /^publish$/i }).first().click(); await pg.waitForTimeout(2500); out.push(`republished; publish buttons ${await pg.locator("button", { hasText: /^publish$/i }).count()}`); } else out.push("no unpublish button (before=" + before + ")");
out.push("audit entries: " + (await pg.locator("text=/publish/i").count()));
await pg.getByText("Log out").click(); await pg.locator('input[name="password"]').waitFor({ timeout: 10000 }).catch(() => {}); out.push("logged out: " + (await pg.locator('input[name="password"]').count() > 0));
console.log(out.join("\n")); await b.close();
