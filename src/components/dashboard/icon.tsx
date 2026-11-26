import type { DashboardTone } from "@/lib/dashboard";

export type DashboardIconName =
  | "sales"
  | "profit"
  | "cash"
  | "receivable"
  | "payable"
  | "stock"
  | "users"
  | "clock"
  | "invoice"
  | "alert"
  | "shield"
  | "evidence"
  | "reverse"
  | "void"
  | "location"
  | "package"
  | "report"
  | "lock"
  | "check";

const GLYPH_ICON: Record<string, DashboardIconName> = {
  "₵": "sales",
  "%": "invoice",
  "↗": "profit",
  "⇄": "cash",
  "◎": "receivable",
  "◑": "payable",
  "▦": "stock",
  "◉": "users",
  "◷": "clock",
  "▣": "alert",
  "◆": "package",
  "!": "alert",
  "↺": "reverse",
  "◇": "evidence",
  "⊘": "void",
  "▤": "package",
  "⌖": "location",
};

const PATHS: Record<DashboardIconName, string[]> = {
  sales: ["M3 8.5h18v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-9Z", "M6.5 12h4", "M16 12h1.5"],
  profit: ["m4 16 5-5 3.5 3.5L20 7", "M15 7h5v5"],
  cash: ["M4 9h13", "m14 6 3 3-3 3", "M20 15H7", "m10 12-3 3 3 3"],
  receivable: ["M4 7.5h13a3 3 0 0 1 3 3v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-10Z", "M4 7.5a2.5 2.5 0 0 1 2.5-2.5H17", "M16 14h2"],
  payable: ["M4 13h12v3a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-3Z", "M8 13V8a2 2 0 0 1 2-2h4", "M11 6h5l-1.5 2.5L16 11h-5"],
  stock: ["m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z", "m4 7.5 8 4.5 8-4.5", "M12 12v9"],
  users: ["M8.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z", "M2.5 20a6 6 0 0 1 12 0", "M16 5.2a3.5 3.5 0 0 1 0 6.6", "M17 14.5a6 6 0 0 1 4.5 5.5"],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 7v5l3.5 2"],
  invoice: ["M6 3h9l4 4v14H6V3Z", "M15 3v5h4", "M9 12h6", "M9 16h4"],
  alert: ["m12 4 9 16H3l9-16Z", "M12 10v4.5", "M12 17.2h.01"],
  shield: ["M12 3 5 6v5c0 4.4 2.8 8.3 7 10 4.2-1.7 7-5.6 7-10V6l-7-3Z", "m9 12 2 2 4-4"],
  evidence: ["M9 12.5 14 7a3 3 0 0 1 4.2 4.2l-6.4 6.4a5 5 0 0 1-7-7l6.2-6.2", "M8 15h.01"],
  reverse: ["M4 11a8 8 0 1 1 2.3 6.2", "M4 5v6h6"],
  void: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "m9 9 6 6", "m15 9-6 6"],
  location: ["M12 21s7-5.8 7-12a7 7 0 1 0-14 0c0 6.2 7 12 7 12Z", "M12 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"],
  package: ["m4 8 8-4 8 4-8 4-8-4Z", "M4 8v8l8 4 8-4V8", "M12 12v8"],
  report: ["M4 20V10", "M10 20V4", "M16 20v-7", "M22 20H2"],
  lock: ["M6 10V7a6 6 0 0 1 12 0v3", "M4 10h16v10H4V10Z", "M12 14v2"],
  check: ["m5 12 4.5 4.5L19 7"],
};

interface DashboardIconProps {
  name?: DashboardIconName;
  glyph?: string;
  size?: number;
  className?: string;
  tone?: DashboardTone;
}

export function DashboardIcon({ name, glyph, size = 20, className = "", tone }: DashboardIconProps) {
  const resolved = name ?? (glyph ? GLYPH_ICON[glyph] : undefined) ?? "report";
  const paths = PATHS[resolved] ?? PATHS.report;
  return (
    <svg
      aria-hidden="true"
      className={`mk-icon ${tone ? `mk-tone--${tone}` : ""} ${className}`.trim()}
      focusable="false"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {paths.map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}
