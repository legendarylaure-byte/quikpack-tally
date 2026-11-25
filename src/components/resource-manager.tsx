"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import { moneyInput, parseMoney } from "@/lib/money";
import { useAuth } from "./auth-provider";

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "checkbox" | "textarea" | "money" | "percent";
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  hint?: string;
}

export interface ColumnDef {
  key: string;
  label: string;
  format?: (value: unknown, row: Record<string, unknown>) => string;
}

interface Row extends Record<string, unknown> {
  id: string;
}

const inputClass =
  "mt-1 w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm text-navy outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

export function ResourceManager({
  collection,
  title,
  description,
  fields,
  columns,
  defaults,
  canWrite,
  onChanged,
}: {
  collection: string;
  title: string;
  description?: string;
  fields: FieldDef[];
  columns: ColumnDef[];
  defaults: Record<string, unknown>;
  canWrite: boolean;
  onChanged?: () => void;
}) {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    if (!user) {
      return;
    }
    try {
      const token = await user.getIdToken();
      const data = await apiFetch<{ items: Row[] }>(token, `/api/data/${collection}`);
      setRows(data.items);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [user, collection]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  function openCreate() {
    setDraft({ ...defaults });
    setEditingId(null);
    setError("");
    setNotice("");
  }

  function openEdit(row: Row) {
    const next: Record<string, unknown> = { ...defaults };
    for (const field of fields) {
      const value = row[field.key];
      next[field.key] =
        field.type === "money"
          ? moneyInput(Number(value ?? 0))
          : field.type === "percent"
            ? String(Number(value ?? 0) * 100)
            : value;
    }
    setDraft(next);
    setEditingId(row.id);
    setError("");
    setNotice("");
  }

  function setField(key: string, value: unknown) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft || !user) {
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const token = await user.getIdToken();
      const payload: Record<string, unknown> = {};
      for (const field of fields) {
        const value = draft[field.key];
        if (field.type === "money") {
          payload[field.key] = parseMoney(String(value ?? "0"));
        } else if (field.type === "percent") {
          const percent = Number(value ?? 0);
          if (!Number.isFinite(percent) || percent < 0) {
            throw new Error(`${field.label} must be a positive percentage.`);
          }
          payload[field.key] = percent / 100;
        } else if (field.type === "number") {
          payload[field.key] = Number(value ?? 0);
        } else if (field.type === "checkbox") {
          payload[field.key] = value === true;
        } else {
          payload[field.key] = value;
        }
      }
      if (editingId) {
        await apiFetch(token, `/api/data/${collection}/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setNotice("Record updated.");
      } else {
        await apiFetch(token, `/api/data/${collection}`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setNotice("Record created.");
      }
      setDraft(null);
      setEditingId(null);
      await load();
      onChanged?.();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!user || !window.confirm("Delete this record?")) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const token = await user.getIdToken();
      await apiFetch(token, `/api/data/${collection}/${id}`, { method: "DELETE" });
      setNotice("Record deleted.");
      await load();
      onChanged?.();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="glass-panel rounded-2xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-navy">{title}</h2>
          {description ? <p className="mt-1 text-sm text-navy/65">{description}</p> : null}
        </div>
        {canWrite ? (
          <button
            type="button"
            onClick={openCreate}
            className="brand-gradient rounded-xl px-5 py-2.5 text-sm font-bold text-white transition disabled:opacity-60"
          >
            Add {title.toLowerCase()}
          </button>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-xl bg-error/10 p-3 text-sm text-error">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="mt-4 rounded-xl bg-brand/15 p-3 text-sm font-semibold text-brand">
          {notice}
        </p>
      ) : null}

      {draft ? (
        <form onSubmit={submit} className="mt-6 rounded-2xl border border-brand/25 bg-white/60 p-5">
          <p className="mb-4 text-sm font-bold text-navy">
            {editingId ? "Edit record" : "New record"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <label
                key={field.key}
                className={`block text-sm font-semibold text-navy ${
                  field.type === "textarea" ? "sm:col-span-2" : ""
                }`}
              >
                {field.label}
                {field.type === "select" ? (
                  <select
                    value={String(draft[field.key] ?? "")}
                    onChange={(event) => setField(field.key, event.target.value)}
                    required={field.required}
                    className={inputClass}
                  >
                    <option value="">Select…</option>
                    {(field.options ?? []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "checkbox" ? (
                  <input
                    type="checkbox"
                    checked={draft[field.key] === true}
                    onChange={(event) => setField(field.key, event.target.checked)}
                    className="mt-2 size-5 accent-brand"
                  />
                ) : field.type === "textarea" ? (
                  <textarea
                    value={String(draft[field.key] ?? "")}
                    onChange={(event) => setField(field.key, event.target.value)}
                    required={field.required}
                    rows={3}
                    className={inputClass}
                  />
                ) : (
                  <input
                    type={
                      field.type === "date"
                        ? "date"
                        : ["number", "money", "percent"].includes(field.type)
                          ? "number"
                          : "text"
                    }
                    step={field.type === "money" || field.type === "percent" ? "0.01" : "1"}
                    value={String(draft[field.key] ?? "")}
                    onChange={(event) => setField(field.key, event.target.value)}
                    required={field.required}
                    className={inputClass}
                  />
                )}
                {field.hint ? (
                  <span className="mt-1 block text-xs font-normal text-navy/55">{field.hint}</span>
                ) : null}
              </label>
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="brand-gradient rounded-xl px-6 py-2.5 text-sm font-bold text-white transition disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(null);
                setEditingId(null);
              }}
              className="rounded-xl border border-navy/15 px-5 py-2.5 text-sm font-bold text-navy"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="mt-6 overflow-x-auto">
        {loading ? (
          <p className="text-sm text-navy/65">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-navy/20 p-6 text-sm text-navy/60">
            No records yet. {canWrite ? "Add the first one above." : ""}
          </p>
        ) : (
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy/10 text-xs uppercase tracking-wide text-navy/50">
                {columns.map((column) => (
                  <th key={column.key} className="px-3 py-2 font-bold">
                    {column.label}
                  </th>
                ))}
                {canWrite ? <th className="px-3 py-2 font-bold">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-navy/5 last:border-0">
                  {columns.map((column) => (
                    <td key={column.key} className="px-3 py-3 text-navy/80">
                      {column.format
                        ? column.format(row[column.key], row)
                        : displayValue(row[column.key])}
                    </td>
                  ))}
                  {canWrite ? (
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="text-xs font-bold text-brand hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(row.id)}
                          disabled={busy}
                          className="text-xs font-bold text-error hover:underline disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
