"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { AdminGuard } from "@/components/auth-guard";
import { useAuth } from "@/components/auth-provider";
import { SignOutButton } from "@/components/sign-out-button";
import { getErrorMessage } from "@/lib/errors";
import {
  FEATURES,
  ROLES,
  USER_STATUSES,
  defaultPermissions,
  type Permissions,
  type Role,
  type UserStatus,
} from "@/lib/permissions";

interface ManagedUser {
  uid: string;
  email: string;
  fullName: string;
  role: Role;
  status: UserStatus;
  permissions: Permissions;
  createdAt: string | null;
}

interface Draft {
  role: Role;
  status: UserStatus;
  permissions: Permissions;
}

const inputClass =
  "mt-1 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-navy outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

async function apiRequest<T>(token: string, path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status}).`);
  }
  return data as T;
}

function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<Role>("accountant");

  const loadUsers = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      const token = await user.getIdToken();
      const data = await apiRequest<{ users: ManagedUser[] }>(
        token,
        "/api/admin/users",
      );
      setUsers(data.users);
      const nextDrafts: Record<string, Draft> = {};
      for (const managed of data.users) {
        nextDrafts[managed.uid] = {
          role: managed.role,
          status: managed.status,
          permissions: { ...managed.permissions },
        };
      }
      setDrafts(nextDrafts);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void Promise.resolve().then(() => loadUsers());
  }, [loadUsers]);

  function updateDraft(uid: string, patch: Partial<Draft>) {
    setDrafts((current) => {
      const existing = current[uid];
      if (!existing) {
        return current;
      }
      return {
        ...current,
        [uid]: {
          ...existing,
          ...patch,
          permissions: patch.permissions ?? existing.permissions,
        },
      };
    });
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy("create");

    try {
      const token = await user!.getIdToken();
      const result = await apiRequest<{ inviteSent: boolean; warning?: string }>(
        token,
        "/api/admin/users",
        {
          method: "POST",
          body: JSON.stringify({
            email: newEmail,
            fullName: newName,
            role: newRole,
            permissions: defaultPermissions(newRole),
          }),
        },
      );
      setNotice(
        result.inviteSent
          ? "User created and invite email sent."
          : `User created, but the invite email failed: ${result.warning ?? "unknown error"}`,
      );
      setNewName("");
      setNewEmail("");
      await loadUsers();
    } catch (createError) {
      setError(getErrorMessage(createError));
    } finally {
      setBusy("");
    }
  }

  async function handleSave(managed: ManagedUser) {
    const draft = drafts[managed.uid];
    if (!draft) {
      return;
    }

    setError("");
    setNotice("");
    setBusy(managed.uid);

    try {
      const token = await user!.getIdToken();
      await apiRequest(token, `/api/admin/users/${managed.uid}`, {
        method: "PATCH",
        body: JSON.stringify(draft),
      });
      setNotice("Access updated.");
      await loadUsers();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setBusy("");
    }
  }

  async function handleResend(managed: ManagedUser) {
    setError("");
    setNotice("");
    setBusy(managed.uid);

    try {
      const token = await user!.getIdToken();
      await apiRequest(token, `/api/admin/users/${managed.uid}/invite`, {
        method: "POST",
      });
      setNotice("New password setup link sent.");
    } catch (resendError) {
      setError(getErrorMessage(resendError));
    } finally {
      setBusy("");
    }
  }

  return (
    <AppShell
      title="Users & access"
      subtitle="Create users, assign roles and control which features they can use."
      actions={<SignOutButton />}
    >
      {error ? (
        <p role="alert" className="mb-5 rounded-xl bg-error/10 p-4 text-sm text-error">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="mb-5 rounded-xl bg-brand/15 p-4 text-sm font-semibold text-brand">
          {notice}
        </p>
      ) : null}

      <section className="glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-bold text-navy">Add a user</h2>
        <p className="mt-1 text-sm text-navy/65">
          The user receives a password setup link by email. Access starts as approved.
        </p>
        <form onSubmit={handleCreate} className="mt-5 grid gap-4 sm:grid-cols-3">
          <label className="block text-sm font-semibold text-navy sm:col-span-1">
            Full name
            <input
              required
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-semibold text-navy sm:col-span-1">
            Email
            <input
              type="email"
              required
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-semibold text-navy sm:col-span-1">
            Role
            <select
              value={newRole}
              onChange={(event) => setNewRole(event.target.value as Role)}
              className={inputClass}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={busy === "create"}
              className="brand-gradient rounded-xl px-6 py-3 text-sm font-bold text-white transition disabled:opacity-60"
            >
              {busy === "create" ? "Creating…" : "Create user & send invite"}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 space-y-5">
        <h2 className="text-lg font-bold text-navy">Users</h2>
        {loading ? (
          <p className="text-sm text-navy/65">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="glass-panel rounded-2xl p-6 text-sm text-navy/65">
            No users yet. Add the first one above.
          </p>
        ) : (
          users.map((managed) => {
            const draft = drafts[managed.uid];
            if (!draft) {
              return null;
            }

            return (
              <article
                key={managed.uid}
                className="glass-panel rounded-2xl p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-navy">{managed.fullName || managed.email}</p>
                    <p className="text-xs text-navy/60">{managed.email}</p>
                  </div>
                  <span className="rounded-full bg-navy/5 px-3 py-1 text-xs font-bold text-navy/60">
                    {managed.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-navy">
                    Role
                    <select
                      value={draft.role}
                      onChange={(event) =>
                        updateDraft(managed.uid, {
                          role: event.target.value as Role,
                        })
                      }
                      className={inputClass}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-semibold text-navy">
                    Status
                    <select
                      value={draft.status}
                      onChange={(event) =>
                        updateDraft(managed.uid, {
                          status: event.target.value as UserStatus,
                        })
                      }
                      className={inputClass}
                    >
                      {USER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                  {FEATURES.map((feature) => (
                    <label
                      key={feature.key}
                      className="flex items-center gap-2 text-sm font-semibold text-navy/75"
                    >
                      <input
                        type="checkbox"
                        checked={draft.permissions[feature.key]}
                        onChange={(event) =>
                          updateDraft(managed.uid, {
                            permissions: {
                              ...draft.permissions,
                              [feature.key]: event.target.checked,
                            },
                          })
                        }
                        className="size-4 accent-[#7dbd17]"
                      />
                      {feature.label}
                    </label>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleSave(managed)}
                    disabled={busy === managed.uid}
                    className="rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-info disabled:opacity-60"
                  >
                    Save changes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResend(managed)}
                    disabled={busy === managed.uid}
                    className="rounded-xl border border-navy/15 px-5 py-2.5 text-sm font-bold text-navy transition hover:border-brand hover:text-brand disabled:opacity-60"
                  >
                    Resend invite
                  </button>
                </div>
              </article>
            );
          })
        )}
      </section>
    </AppShell>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <UserManagement />
    </AdminGuard>
  );
}
