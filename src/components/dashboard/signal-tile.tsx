import type { DashboardKpi, DashboardTone } from "@/lib/dashboard";
import type { DashboardTip } from "@/lib/dashboard-copy";
import { DashboardIcon } from "./icon";
import { InfoPopover } from "./info-popover";

interface SignalTileProps {
  kpi: DashboardKpi;
  tips: Record<string, DashboardTip>;
}

function toneClass(tone?: DashboardTone): string {
  return `mk-tone--${tone ?? "info"}`;
}

export function SignalTile({ kpi, tips }: SignalTileProps) {
  const series = kpi.series ?? [];
  const peak = Math.max(...series, 1);
  const progress = Math.max(0, Math.min(1, kpi.progress ?? 0));

  return (
    <article className={`mk-signal mk-signal--insight ${toneClass(kpi.tone)}`}>
      <div className="mk-signal__top">
        <span className="mk-signal__label">
          <span className="mk-signal__icon" aria-hidden="true">
            <DashboardIcon glyph={kpi.glyph} size={18} tone={kpi.tone} />
          </span>
          {kpi.label}
        </span>
        <InfoPopover tipKey={kpi.tipKey} tips={tips} />
      </div>

      <strong className="mk-signal__value">{kpi.value}</strong>
      <small className="mk-signal__note">{kpi.note}</small>

      {series.length > 0 ? (
        <div className="mk-spark" aria-hidden="true">
          {series.map((value, index) => (
            <span
              key={index}
              className={`mk-spark__bar ${toneClass(kpi.tone)}`}
              style={{ height: `${Math.max(10, Math.round((value / peak) * 100))}%` }}
            />
          ))}
        </div>
      ) : null}

      <span className="mk-progress" aria-hidden="true">
        <span
          className={`mk-progress__fill ${toneClass(kpi.tone)}`}
          style={{ width: `${Math.max(4, Math.round(progress * 100))}%` }}
        />
      </span>
    </article>
  );
}
