import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-mnemo-background text-mnemo-text flex flex-col">
      <nav className="border-b border-mnemo-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-semibold tracking-tight">
            MNEMO
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <AuthForm mode="login" />
      </main>
    </div>
  );
}
