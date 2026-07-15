"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  const isLogin = mode === "login";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setConfirmationMessage(null);

    try {
      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
        if (!data.session) {
          throw new Error("Please confirm your email before logging in.");
        }
        router.push("/dashboard");
        router.refresh();
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authError) throw authError;
        if (!data.session) {
          setConfirmationMessage("Check your email to confirm your account.");
          setEmail("");
          setPassword("");
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl font-semibold mb-2">
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-mnemo-muted text-sm">
          {isLogin
            ? "Enter your details to continue to MNEMO."
            : "Sign up to start building your second brain."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 bg-mnemo-surface border-mnemo-border rounded-lg focus-visible:ring-mnemo-accent"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="h-11 bg-mnemo-surface border-mnemo-border rounded-lg focus-visible:ring-mnemo-accent"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        {confirmationMessage && (
          <div className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
            {confirmationMessage}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-mnemo-primary hover:bg-mnemo-primary/90 text-white rounded-lg font-medium"
        >
          {loading ? (isLogin ? "Signing in..." : "Creating account...") : isLogin ? "Continue" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-mnemo-muted">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <Link
          href={isLogin ? "/auth/signup" : "/auth/login"}
          className="text-mnemo-primary hover:underline font-medium"
        >
          {isLogin ? "Sign up" : "Log in"}
        </Link>
      </p>
    </div>
  );
}
