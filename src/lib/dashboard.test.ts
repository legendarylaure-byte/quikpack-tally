import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BriefView } from "../components/dashboard/brief-view";
import { getDashboardFixtures } from "./dashboard.fixtures";
import { buildDashboardBrief } from "./dashboard";
import { defaultPermissions, type Role } from "./permissions";

function canFor(role: Role) {
  return (feature: keyof ReturnType<typeof defaultPermissions>) =>
    role === "admin" || defaultPermissions(role)[feature];
}

test("admin dashboard includes all role summaries and all features", () => {
  const brief = buildDashboardBrief({
    role: "admin",
    can: canFor("admin"),
    data: getDashboardFixtures(),
  });

  assert.equal(brief.can.length, 7);
  assert.equal(brief.cannot.length, 0);
  assert.ok(brief.blocks.some((block) => block.key === "role-summaries"));
  assert.equal(brief.snapshots.length, 4);
  assert.ok(brief.charts.some((chart) => chart.key === "sales-week"));
  assert.ok(brief.charts.some((chart) => chart.key === "cash-split"));
  assert.ok(brief.actions.some((action) => action.href === "/admin/users"));
});

test("low stock alert uses plain language and points to inventory", () => {
  const brief = buildDashboardBrief({
    role: "cashier",
    can: canFor("cashier"),
    data: getDashboardFixtures(),
  });

  const lowStock = brief.attention.find((item) => item.key === "low-stock");
  assert.ok(lowStock);
  assert.equal(lowStock.tipKey, "reorder");
  assert.equal(lowStock.href, "/inventory");
  assert.match(lowStock.title, /Stock needs attention · 3 items/);
  assert.match(lowStock.detail, /minimum stock level/);
  assert.match(brief.tips.reorder.meaning, /minimum quantity/);
});

test("cashier dashboard hides reports and settings actions", () => {
  const brief = buildDashboardBrief({
    role: "cashier",
    can: canFor("cashier"),
    data: getDashboardFixtures(),
  });

  assert.ok(brief.cannot.includes("Reports"));
  assert.ok(brief.cannot.includes("Settings"));
  assert.ok(!brief.actions.some((action) => action.href === "/reports"));
  assert.ok(brief.actions.some((action) => action.href === "/invoices"));
  assert.ok(brief.charts.some((chart) => chart.key === "invoice-flow"));
  assert.ok(brief.charts.some((chart) => chart.key === "stock-heat"));
});

test("viewer dashboard is read-only", () => {
  const brief = buildDashboardBrief({
    role: "viewer",
    can: canFor("viewer"),
    data: getDashboardFixtures(),
  });

  assert.ok(brief.cannot.includes("Vouchers"));
  assert.ok(brief.cannot.includes("Invoicing"));
  assert.ok(brief.playbook.some((step) => step.title === "Request corrections"));
  assert.ok(!brief.actions.some((action) => action.href === "/invoices"));
});

test("auditor dashboard focuses on evidence and exceptions", () => {
  const brief = buildDashboardBrief({
    role: "auditor",
    can: canFor("auditor"),
    data: getDashboardFixtures(),
  });

  assert.ok(brief.kpis.some((kpi) => kpi.key === "exceptions"));
  assert.ok(brief.kpis.some((kpi) => kpi.key === "evidence"));
  assert.ok(brief.blocks.some((block) => block.key === "timeline"));
  assert.ok(!brief.actions.some((action) => action.href === "/vouchers"));
});

test("accountant dashboard includes CFO intelligence sections", () => {
  const brief = buildDashboardBrief({
    role: "accountant",
    can: canFor("accountant"),
    data: getDashboardFixtures(),
  });

  assert.ok(brief.kpis.some((kpi) => kpi.key === "revenue"));
  assert.ok(brief.kpis.some((kpi) => kpi.key === "vat"));
  assert.ok(brief.blocks.some((block) => block.key === "pnl"));
  assert.ok(brief.blocks.some((block) => block.key === "aging"));
});

test("empty workspace does not invent sales history", () => {
  const brief = buildDashboardBrief({
    role: "admin",
    can: canFor("admin"),
    data: {},
  });

  const salesWeek = brief.charts.find((chart) => chart.key === "sales-week");
  assert.ok(salesWeek);
  assert.equal(salesWeek.items.length, 0);
  assert.match(salesWeek.emptyText ?? "", /Not enough history yet/);
});

test("dashboard view renders plain-language role guidance", () => {
  const now = new Date("2026-11-26T09:00:00.000Z");
  const brief = buildDashboardBrief({
    role: "admin",
    can: canFor("admin"),
    data: getDashboardFixtures(),
    now,
  });
  const html = renderToStaticMarkup(
    createElement(BriefView, {
      brief,
      lastChecked: now,
      refreshing: false,
      isDemo: true,
      onRefresh: () => undefined,
    }),
  );

  assert.match(html, /Business pulse/);
  assert.match(html, /Role snapshots/);
  assert.match(html, /Explain What is a reorder level\?/);
  assert.match(html, /Role playbook/);
  assert.match(html, /Local preview data is on/);
  assert.equal(html.match(/mk-focus__segment/g)?.length, 5);
  for (const key of ["stock", "invoices", "access", "tax", "audit"]) {
    assert.match(html, new RegExp(`mk-check--${key}`));
  }
  assert.match(html, /mk-check__label/);
  assert.match(html, /mk-info-button/);
  assert.match(html, /mk-focus__footer/);
  assert.match(html, /action cards/);
  assert.match(html, /mk-progress__fill/);
  assert.match(html, /<svg/);
});
