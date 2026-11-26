"use client";

import { useId, useState, type KeyboardEvent } from "react";
import type { DashboardTip } from "@/lib/dashboard-copy";

interface InfoPopoverProps {
  tipKey: string;
  tips: Record<string, DashboardTip>;
  label?: string;
}

export function InfoPopover({ tipKey, tips, label }: InfoPopoverProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const tip = tips[tipKey];
  if (!tip) {
    return null;
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <span
      className="mk-info-tip"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="mk-info-button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={label ?? `Explain ${tip.title}`}
        onClick={() => setOpen((value) => !value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      >
        i
      </button>
      {open ? (
        <span className="mk-tip-panel" role="tooltip" id={id}>
          <span className="mk-tip-panel__head">
            <strong>{tip.title}</strong>
          </span>
          <span className="mk-tip-panel__meaning">{tip.meaning}</span>
          <span className="mk-tip-row">
            <b>How it is calculated</b>
            <span>{tip.calculation}</span>
          </span>
          <span className="mk-tip-row">
            <b>Data source</b>
            <span>{tip.source}</span>
          </span>
          <span className="mk-tip-row">
            <b>What to do</b>
            <span>{tip.action}</span>
          </span>
          <span className="mk-tip-row">
            <b>Who can help</b>
            <span>{tip.contact}</span>
          </span>
        </span>
      ) : null}
    </span>
  );
}
