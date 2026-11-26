"use client";

import Link from "next/link";
import type { DashboardBrief } from "@/lib/dashboard";
import { FocusGauge } from "./focus-gauge";
import { DashboardIcon } from "./icon";
import { InfoPopover } from "./info-popover";
import { MiniChart } from "./mini-chart";
import { PriorityDeck } from "./priority-deck";
import { RolePlaybook } from "./role-playbook";
import { SignalTile } from "./signal-tile";

interface BriefViewProps {
  brief: DashboardBrief;
  lastChecked: Date;
  refreshing: boolean;
  isDemo: boolean;
  onRefresh: () => void;
}

export function BriefView({ brief, lastChecked, refreshing, isDemo, onRefresh }: BriefViewProps) {
  const updated = lastChecked.toLocaleTimeString("en-GH", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`mk-dashboard mk-dashboard--${brief.role}`}>
      <section className="mk-role-strip" aria-label="Your role and access">
        <div className="mk-role-strip__main">
          <span className="mk-role-badge">
            <DashboardIcon name="shield" size={15} />
            {brief.role}
          </span>
          <div>
            <h2>{brief.title}</h2>
            <span className="mk-role-strip__branch"><i aria-hidden="true" />{brief.branch} branch</span>
          </div>
        </div>
        <div className="mk-role-strip__meta">
          <span>Checked {updated}</span>
          <button type="button" className="mk-refresh" onClick={onRefresh} disabled={refreshing}>
            <DashboardIcon name="reverse" size={16} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </section>

      {isDemo ? (
        <p className="mk-demo-banner" role="status">
          <DashboardIcon name="evidence" size={16} />
          Local preview data is on. Firebase, dev and live data are untouched.
        </p>
      ) : null}

      <FocusGauge brief={brief} />

      {brief.isEmpty ? (
        <section className="mk-empty mk-empty--setup" aria-label="New workspace">
          <span className="mk-empty__icon" aria-hidden="true"><DashboardIcon name="stock" size={18} /></span>
          <div>
            <strong>Ready to learn your business.</strong>
            <p>Add items, invoices or vouchers and the signals will fill in automatically.</p>
          </div>
          <Link className="mk-action mk-action--primary" href="/inventory">Start with stock</Link>
        </section>
      ) : null}

      <PriorityDeck items={brief.attention} tips={brief.tips} />

      <section className="mk-section" aria-labelledby="mk-signals-heading">
        <div className="mk-section__head">
          <h2 id="mk-signals-heading">Business pulse</h2>
          <span className="mk-section__count">GHS · {brief.trendNote}</span>
        </div>
        <div className="mk-signal-grid">
          {brief.kpis.map((kpi) => (
            <SignalTile key={kpi.key} kpi={kpi} tips={brief.tips} />
          ))}
        </div>
      </section>

      <section className="mk-section" aria-labelledby="mk-charts-heading">
        <div className="mk-section__head">
          <h2 id="mk-charts-heading">Analytics</h2>
          <span className="mk-section__count">Real records only</span>
        </div>
        <div className="mk-chart-grid">
          {brief.charts.map((chart) => (
            <MiniChart key={chart.key} chart={chart} tips={brief.tips} />
          ))}
        </div>
      </section>

      {brief.snapshots.length > 0 ? (
        <section className="mk-section" aria-labelledby="mk-snapshots-heading">
          <div className="mk-section__head">
            <h2 id="mk-snapshots-heading">Role snapshots</h2>
            <span className="mk-section__count">Read-only</span>
          </div>
          <div className="mk-snapshot-grid">
            {brief.snapshots.map((snapshot) => (
              <Link key={snapshot.role} href={snapshot.href} className={`mk-snapshot mk-tone--${snapshot.tone}`}>
                <span className="mk-snapshot__role">
                  <DashboardIcon name="users" size={15} />
                  {snapshot.title}
                  <InfoPopover tipKey="roleSnapshot" tips={brief.tips} label={`Explain ${snapshot.title} snapshot`} />
                </span>
                <strong>{snapshot.value}</strong>
                <small>{snapshot.note}</small>
                <span className="mk-snapshot__open">Open →</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mk-lower-grid" aria-label="Actions and role guide">
        <article className="mk-panel">
          <h3>Next actions</h3>
          <div className="mk-actions">
            {brief.actions.length === 0 ? (
              <span className="mk-muted">No action links for this role.</span>
            ) : (
              brief.actions.map((action) => (
                <Link
                  key={`${action.label}-${action.href}`}
                  href={action.href}
                  className={action.primary ? "mk-action mk-action--primary" : "mk-action"}
                >
                  <DashboardIcon name="check" size={15} />
                  {action.label}
                </Link>
              ))
            )}
          </div>
          <details className="mk-access">
            <summary>Your access</summary>
            <div className="mk-chips">
              {brief.can.map((feature) => (
                <span key={feature} className="mk-chip mk-chip--yes">{feature}</span>
              ))}
              {brief.cannot.map((feature) => (
                <span key={feature} className="mk-chip mk-chip--no">{feature}</span>
              ))}
            </div>
            <p className="mk-note">
              {brief.accessNote}
              <InfoPopover tipKey="access" tips={brief.tips} />
            </p>
          </details>
        </article>

        <RolePlaybook steps={brief.playbook} />
      </section>
    </div>
  );
}
