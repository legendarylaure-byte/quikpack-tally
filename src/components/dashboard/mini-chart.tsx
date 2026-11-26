import type { DashboardChart, DashboardTone } from "@/lib/dashboard";
import type { DashboardTip } from "@/lib/dashboard-copy";
import { DashboardIcon } from "./icon";
import { InfoPopover } from "./info-popover";

interface MiniChartProps {
  chart: DashboardChart;
  tips: Record<string, DashboardTip>;
}

const TONE_COLOR: Record<DashboardTone, string> = {
  healthy: "#3f6a12",
  attention: "#b26a00",
  critical: "#b42318",
  info: "#275d8c",
};

function toneClass(tone?: DashboardTone): string {
  return `mk-tone--${tone ?? "info"}`;
}

export function MiniChart({ chart, tips }: MiniChartProps) {
  const empty = chart.items.length === 0;
  const ratioTotal = chart.items.reduce((sum, item) => sum + (item.ratio ?? 0), 0);

  const { stops: donutStops } = chart.items.reduce(
    (acc, item) => {
      const share = ratioTotal > 0 ? ((item.ratio ?? 0) / ratioTotal) * 100 : 100 / Math.max(chart.items.length, 1);
      const end = acc.end + share;
      return {
        end,
        stops: [...acc.stops, `${TONE_COLOR[item.tone ?? "info"]} ${acc.end}% ${end}%`],
      };
    },
    { end: 0, stops: [] as string[] },
  );

  return (
    <article className="mk-chart">
      <div className="mk-chart__head">
        <div>
          <h3>
            <DashboardIcon name="report" size={16} />
            {chart.title}
          </h3>
          {chart.subtitle ? <p>{chart.subtitle}</p> : null}
        </div>
        <InfoPopover tipKey={chart.tipKey} tips={tips} />
      </div>

      {empty ? (
        <div className="mk-chart__empty">
          <DashboardIcon name="clock" size={22} />
          <p>{chart.emptyText ?? "No data to show yet."}</p>
        </div>
      ) : null}

      {!empty && chart.type === "donut" ? (
        <div className="mk-chart__donut">
          <span
            className="mk-donut"
            style={{ background: `conic-gradient(${donutStops.join(",")})` }}
            aria-hidden="true"
          >
            <i>
              <strong>{chart.items.length}</strong>
              parts
            </i>
          </span>
          <div className="mk-donut-legend">
            {chart.items.map((item, index) => (
              <span key={`${item.label}-${index}`}>
                <i className={toneClass(item.tone)} aria-hidden="true" />
                {item.label}
                <strong>{item.value}</strong>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {!empty && chart.type === "bars" ? (
        <div className="mk-chart__bars">
          {chart.items.map((item, index) => (
            <div className="mk-bar-row" key={`${item.label}-${index}`}>
              <div className="mk-bar-row__label">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
              <div className="mk-bar-track">
                <span
                  className={`mk-bar-fill ${toneClass(item.tone)}`}
                  style={{ width: `${Math.max(4, Math.round((item.ratio ?? 0) * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!empty && chart.type === "stack" ? (
        <div className="mk-chart__stack">
          <div className="mk-stack-rail">
            {chart.items.map((item, index) => (
              <span
                key={`${item.label}-${index}`}
                className={`mk-stack-segment ${toneClass(item.tone)}`}
                style={{ width: `${Math.round((item.ratio ?? 0) * 100)}%` }}
                title={`${item.label}: ${item.value}`}
              />
            ))}
          </div>
          <div className="mk-stack-legend">
            {chart.items.map((item, index) => (
              <span key={`${item.label}-legend-${index}`}>
                <i className={toneClass(item.tone)} aria-hidden="true" />
                {item.label}
                <strong>{item.value}</strong>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {!empty && chart.type === "timeline" ? (
        <ol className="mk-timeline">
          {chart.items.map((item, index) => (
            <li key={`${item.label}-${index}`}>
              <i className={toneClass(item.tone)} aria-hidden="true" />
              <div>
                <span className="mk-timeline__label">{item.label}</span>
                <small>{item.value}</small>
              </div>
              <time>{item.time}</time>
            </li>
          ))}
        </ol>
      ) : null}

      {!empty && chart.type === "heat" ? (
        <div className="mk-heat">
          {chart.items.map((item, index) => (
            <span key={`${item.label}-${index}`} className={`mk-heat-chip ${toneClass(item.tone)}`}>
              <DashboardIcon name="stock" size={14} />
              <strong>{item.label}</strong>
              <small>{item.value}</small>
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
