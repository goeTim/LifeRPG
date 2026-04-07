"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Props = { mode: "login" | "register" };

export function AuthForm({ mode }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    if (mode === "register") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        router.push("/dashboard");
      }
    } else {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) {
        setError(loginError.message);
      } else {
        router.push("/dashboard");
      }
    }

    setLoading(false);
  }

  return (
    <form className="card w-full max-w-md space-y-4" onSubmit={onSubmit}>
      <h1 className="text-2xl font-bold">{mode === "register" ? "Account erstellen" : "Willkommen zurück"}</h1>
      {mode === "register" && (
        <label className="space-y-1 text-sm">
          <span>Name</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
      )}
      <label className="space-y-1 text-sm">
        <span>E-Mail</span>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label className="space-y-1 text-sm">
        <span>Passwort</span>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button className="btn-primary w-full" disabled={loading} type="submit">
        {loading ? "Lädt..." : mode === "register" ? "Registrieren" : "Einloggen"}
      </button>
    </form>
  );
}
