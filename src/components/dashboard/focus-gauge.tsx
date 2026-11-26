import Link from "next/link";
import type { DashboardBrief } from "@/lib/dashboard";
import { DashboardIcon, type DashboardIconName } from "./icon";
import { InfoPopover } from "./info-popover";

interface FocusGaugeProps {
  brief: DashboardBrief;
}

export function FocusGauge({ brief }: FocusGaugeProps) {
  const checks = brief.focusChecks;
  const active = checks.filter((check) => check.active).length;
  const total = Math.max(checks.length, 1);
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const step = circumference / total;
  const segmentLength = Math.max(step - 8, 12);

  return (
    <section className="mk-focus" aria-labelledby="mk-focus-heading">
      <div className="mk-focus__gauge">
        <svg viewBox="0 0 120 120" role="img" aria-label={`${active} of ${total} checks reviewed`}>
          <circle className="mk-focus__track" cx="60" cy="60" r={radius} />
          {checks.map((check, index) => (
            <circle
              key={check.key}
              className="mk-focus__segment"
              cx="60"
              cy="60"
              r={radius}
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              strokeDashoffset={-index * step}
              style={{ stroke: check.active ? `var(--mk-check-${check.key})` : "var(--mk-check-idle)" }}
              transform="rotate(-90 60 60)"
            />
          ))}
        </svg>
        <span className="mk-focus__center">
          <strong>{active}/{total}</strong>
          <small>checks reviewed</small>
        </span>
      </div>

      <div className="mk-focus__copy">
        <span className="mk-focus__eyebrow">{brief.hero.eyebrow}</span>
        <h2 id="mk-focus-heading">
          {active === 0 ? "All checks look clear." : `${active} checks need a look.`}
        </h2>
        <p>{brief.hero.detail}</p>

        <div className="mk-focus__checks" role="list">
          {checks.map((check) => (
            <div
              key={check.key}
              role="listitem"
              className={`mk-check mk-check--${check.key}${check.active ? " is-active" : ""}`}
              aria-label={`${check.label}: ${check.active ? "needs attention" : "clear"}`}
            >
              <span className="mk-check__icon" aria-hidden="true">
                <DashboardIcon name={check.icon as DashboardIconName} size={16} />
              </span>
              <span className="mk-check__label">{check.label}</span>
              <span className="mk-check__dot" aria-hidden="true" />
              <InfoPopover
                tipKey={check.tipKey}
                tips={brief.tips}
                label={`Explain ${check.label} check`}
              />
            </div>
          ))}
        </div>

        <div className="mk-focus__footer">
          <Link className="mk-focus__cta" href={brief.hero.actionHref}>
            <DashboardIcon name="check" size={16} />
            {brief.hero.actionLabel}
            <span aria-hidden="true">→</span>
          </Link>
          <span className="mk-focus__metric">
            <DashboardIcon name="report" size={15} />
            <strong>{brief.hero.metric}</strong>
            {brief.hero.metricLabel}
          </span>
        </div>
      </div>
    </section>
  );
}
