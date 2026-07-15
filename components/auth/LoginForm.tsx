"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, Brain } from "lucide-react";
import { createClient } from "@/lib/supabase";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;
      if (!data.session) throw new Error("Please confirm your email before logging in.");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-sm"
      >
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-mnemo-primary to-[#4f2bb8]">
            <Brain className="h-5 w-5 text-white" />
          </span>
          <span className="text-lg font-semibold text-white">Mnemo Brain</span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-white">Welcome back</h1>
        <p className="mt-1.5 text-sm text-mnemo-muted">
          Sign in to continue to your second brain.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <Field
            icon={Mail}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
            label="Email"
          />
          <Field
            icon={Lock}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
            label="Password"
          />

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-black transition-all hover:shadow-[0_0_28px_-6px_rgba(255,255,255,0.6)] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Sign in
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-mnemo-muted">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-medium text-white hover:underline">
            Sign up free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  type,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-white">{label}</label>
      <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 focus-within:border-mnemo-primary/50 focus-within:ring-1 focus-within:ring-mnemo-primary/50">
        <Icon className="h-4 w-4 shrink-0 text-mnemo-muted" />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          minLength={type === "password" ? 6 : undefined}
          className="w-full bg-transparent py-3 text-sm text-white placeholder:text-mnemo-muted focus:outline-none"
        />
      </div>
    </div>
  );
}
