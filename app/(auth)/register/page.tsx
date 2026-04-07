import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6">
      <div className="space-y-4">
        <AuthForm mode="register" />
        <p className="text-center text-sm text-slate-300">
          Schon dabei? <Link href="/login" className="text-violet-300">Einloggen</Link>
        </p>
      </div>
    </main>
  );
}
