"use client";

import { FormEvent, useMemo, useState } from "react";
import { SectionHeader } from "@/components/settings/section-header";
import { SettingsSectionKey } from "@/components/settings/settings-sidebar";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Props = {
  initialName: string;
  activeSection: Extract<SettingsSectionKey, "account-name" | "account-password" | "account-reset">;
};

type Status = { type: "success" | "error"; message: string } | null;

async function apiRequest(url: string, options: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) }
  });

  const payload = (await response.json().catch(() => ({}))) as { error?: string; message?: string; name?: string };
  if (!response.ok) throw new Error(payload.error ?? "Aktion fehlgeschlagen.");
  return payload;
}

function StatusMessage({ status }: { status: Status }) {
  if (!status) return null;

  return (
    <p
      className={`rounded-lg border px-3 py-2 text-sm ${
        status.type === "success" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" : "border-rose-500/40 bg-rose-500/10 text-rose-200"
      }`}
    >
      {status.message}
    </p>
  );
}

export function AccountManagementPanel({ initialName, activeSection }: Props) {
  const [currentName, setCurrentName] = useState(initialName);
  const [nextName, setNextName] = useState(initialName);
  const [nameStatus, setNameStatus] = useState<Status>(null);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<Status>(null);
  const [resetStatus, setResetStatus] = useState<Status>(null);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetConfirmationText, setResetConfirmationText] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const passwordValidationError = useMemo(() => {
    if (!password && !passwordConfirmation) return null;
    if (password.length < 8) return "Passwort muss mindestens 8 Zeichen lang sein.";
    if (password !== passwordConfirmation) return "Passwort und Bestätigung stimmen nicht überein.";
    return null;
  }, [password, passwordConfirmation]);

  async function handleNameSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNameStatus(null);
    const trimmed = nextName.trim();

    if (trimmed.length < 2) return setNameStatus({ type: "error", message: "Der Anzeigename muss mindestens 2 Zeichen lang sein." });
    if (trimmed === currentName) return setNameStatus({ type: "error", message: "Der neue Name entspricht bereits deinem aktuellen Namen." });

    try {
      setIsSavingName(true);
      const payload = await apiRequest("/api/account/name", { method: "PATCH", body: JSON.stringify({ name: trimmed }) });
      setCurrentName(payload.name ?? trimmed);
      setNextName(payload.name ?? trimmed);
      setNameStatus({ type: "success", message: payload.message ?? "Name erfolgreich aktualisiert." });
    } catch (error) {
      setNameStatus({ type: "error", message: error instanceof Error ? error.message : "Name konnte nicht gespeichert werden." });
    } finally {
      setIsSavingName(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordStatus(null);
    if (passwordValidationError) return setPasswordStatus({ type: "error", message: passwordValidationError });

    try {
      setIsSavingPassword(true);
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword("");
      setPasswordConfirmation("");
      setPasswordStatus({ type: "success", message: "Passwort wurde erfolgreich geändert." });
    } catch (error) {
      setPasswordStatus({ type: "error", message: error instanceof Error ? error.message : "Passwort konnte nicht aktualisiert werden." });
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function handleReset() {
    setResetStatus(null);
    if (resetConfirmationText.trim().toUpperCase() !== "RESET") {
      return setResetStatus({ type: "error", message: 'Bitte gib zur Bestätigung exakt "RESET" ein.' });
    }

    try {
      setIsResetting(true);
      const payload = await apiRequest("/api/account/reset-progress", { method: "POST", body: JSON.stringify({ confirmation: "RESET" }) });
      setResetStatus({ type: "success", message: payload.message ?? "Fortschritt erfolgreich zurückgesetzt." });
      setResetConfirmationText("");
      setIsResetOpen(false);
    } catch (error) {
      setResetStatus({ type: "error", message: error instanceof Error ? error.message : "Fortschritt konnte nicht zurückgesetzt werden." });
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <div className="space-y-4">
      {activeSection === "account-name" && (
        <>
          <SectionHeader title="Name ändern" description="Passe deinen Anzeigenamen an." />
          <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
            <p className="text-sm text-slate-400">
              Aktueller Anzeigename: <span className="font-medium text-slate-200">{currentName}</span>
            </p>

            <form className="space-y-3" onSubmit={handleNameSubmit}>
              <label className="block space-y-1 text-xs uppercase tracking-wide text-slate-400">
                <span>Neuer Anzeigename</span>
                <input className="input" value={nextName} onChange={(event) => setNextName(event.target.value)} maxLength={40} />
              </label>
              <button className="btn-primary" type="submit" disabled={isSavingName}>
                {isSavingName ? "Speichern..." : "Speichern"}
              </button>
              <StatusMessage status={nameStatus} />
            </form>
          </section>
        </>
      )}

      {activeSection === "account-password" && (
        <>
          <SectionHeader title="Passwort ändern" description="Aktualisiere dein Passwort sicher über Supabase Auth." />
          <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
            <form className="space-y-3" onSubmit={handlePasswordSubmit}>
              <label className="block space-y-1 text-xs uppercase tracking-wide text-slate-400">
                <span>Neues Passwort</span>
                <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
              </label>
              <label className="block space-y-1 text-xs uppercase tracking-wide text-slate-400">
                <span>Passwort bestätigen</span>
                <input className="input" type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} autoComplete="new-password" />
              </label>

              {passwordValidationError && <p className="text-sm text-amber-300">{passwordValidationError}</p>}

              <button className="btn-primary" type="submit" disabled={isSavingPassword || !!passwordValidationError || !password || !passwordConfirmation}>
                {isSavingPassword ? "Speichern..." : "Speichern"}
              </button>
              <StatusMessage status={passwordStatus} />
            </form>
          </section>
        </>
      )}

      {activeSection === "account-reset" && (
        <>
          <SectionHeader title="Fortschritt zurücksetzen" description="Gefährliche Aktion mit zusätzlicher Bestätigung." />
          <section className="rounded-xl border border-rose-700/40 bg-rose-950/20 p-4 space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-rose-300">Danger Zone</p>
            <p className="text-sm text-rose-200/90">
              Diese Aktion setzt deinen Charakter- und Spielfortschritt zurück (Level, XP, Gold, Attribute, Skills, Inventar und aktive Titel).
              Tasks und Gewohnheiten bleiben bestehen.
            </p>

            <button
              type="button"
              className="rounded-xl border border-rose-500/60 bg-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/30"
              onClick={() => setIsResetOpen(true)}
            >
              Charakterfortschritt zurücksetzen
            </button>

            <StatusMessage status={resetStatus} />
          </section>
        </>
      )}

      {isResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg space-y-4 rounded-2xl border border-rose-600/50 bg-slate-950 p-5 shadow-2xl shadow-black/70">
            <h4 className="text-xl font-semibold text-rose-100">Fortschritt wirklich zurücksetzen?</h4>
            <p className="text-sm text-slate-300">
              Diese Aktion ist nicht rückgängig zu machen. Zur Bestätigung gib bitte <span className="font-semibold text-rose-300">RESET</span> in das Feld ein.
            </p>
            <input className="input border-rose-600/40 focus:border-rose-400" value={resetConfirmationText} onChange={(event) => setResetConfirmationText(event.target.value)} placeholder="RESET" />

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200"
                onClick={() => {
                  setIsResetOpen(false);
                  setResetConfirmationText("");
                }}
                disabled={isResetting}
              >
                Abbrechen
              </button>
              <button
                type="button"
                className="rounded-xl border border-rose-500/70 bg-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleReset}
                disabled={isResetting}
              >
                {isResetting ? "Wird zurückgesetzt..." : "Reset endgültig ausführen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
