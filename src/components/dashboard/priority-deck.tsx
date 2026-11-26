import Link from "next/link";
import type { DashboardAttention, DashboardSeverity } from "@/lib/dashboard";
import type { DashboardTip } from "@/lib/dashboard-copy";
import { DashboardIcon, type DashboardIconName } from "./icon";
import { InfoPopover } from "./info-popover";

interface PriorityDeckProps {
  items: DashboardAttention[];
  tips: Record<string, DashboardTip>;
}

const SHORT_LABEL: Record<string, string> = {
  "low-stock": "Stock risk",
  "overdue-invoices": "Overdue invoices",
  "pending-users": "Access review",
  "audit-risk": "Audit events",
  "supplier-balance": "Supplier dues",
  reversals: "Reversals",
  "awaiting-payment": "Awaiting payment",
  "audit-exceptions": "Audit exceptions",
  "auditor-reversals": "Voucher reversals",
};

const SEVERITY: Record<
  DashboardSeverity,
  { icon: DashboardIconName; label: string; filled: number }
> = {
  critical: { icon: "alert", label: "Critical", filled: 3 },
  attention: { icon: "clock", label: "Attention", filled: 2 },
  info: { icon: "report", label: "Info", filled: 1 },
};

export function PriorityDeck({ items, tips }: PriorityDeckProps) {
  return (
    <section className="mk-section" aria-labelledby="mk-priority-heading">
      <div className="mk-section__head">
        <h2 id="mk-priority-heading">Needs your attention</h2>
        <span className="mk-section__count">{items.length} signal{items.length === 1 ? "" : "s"}</span>
      </div>

      {items.length === 0 ? (
        <div className="mk-empty">
          <span className="mk-empty__icon" aria-hidden="true"><DashboardIcon name="check" size={18} /></span>
          <div>
            <strong>All clear.</strong>
            <p>Follow the playbook for routine work.</p>
          </div>
        </div>
      ) : (
        <div className="mk-priority-deck">
          {items.map((item) => {
            const severity = SEVERITY[item.severity];
            return (
              <article key={item.key} className={`mk-priority mk-priority--${item.severity}`}>
                <div className="mk-priority__top">
                  <span className="mk-priority__icon" aria-hidden="true">
                    <DashboardIcon name={severity.icon} size={18} />
                  </span>
                  <span className="mk-status-pill">{severity.label}</span>
                  <span className="mk-priority__meter" aria-hidden="true">
                    {[0, 1, 2].map((index) => (
                      <i key={index} className={index < severity.filled ? "is-on" : undefined} />
                    ))}
                  </span>
                  <InfoPopover tipKey={item.tipKey} tips={tips} />
                </div>
                <strong className="mk-priority__value">{item.value ?? "Open"}</strong>
                <h3>{SHORT_LABEL[item.key] ?? item.title}</h3>
                {item.href ? (
                  <Link className="mk-priority__cta" href={item.href}>
                    {item.ctaLabel ?? "Open"}
                    <span aria-hidden="true">→</span>
                  </Link>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
