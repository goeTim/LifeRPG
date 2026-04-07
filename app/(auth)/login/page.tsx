import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6">
      <div className="space-y-4">
        <AuthForm mode="login" />
        <p className="text-center text-sm text-slate-300">
          Kein Account? <Link href="/register" className="text-violet-300">Registrieren</Link>
        </p>
      </div>
    </main>
  );
}
