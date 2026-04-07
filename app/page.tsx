import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="rounded-full border border-violet-400/40 bg-violet-500/20 px-4 py-1 text-xs uppercase tracking-[0.2em] text-violet-200">
        Life RPG MVP
      </p>
      <h1 className="text-4xl font-bold md:text-6xl">Level up dein echtes Leben.</h1>
      <p className="max-w-2xl text-slate-300">
        Verwalte Aufgaben, sammle XP, steigere Attribute und schalte Achievements frei –
        im Stil eines cleanen Game-Dashboards.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link className="btn-primary" href="/register">
          Jetzt starten
        </Link>
        <Link className="rounded-xl border border-slate-600 px-4 py-2 font-semibold" href="/login">
          Einloggen
        </Link>
      </div>
    </main>
  );
}
