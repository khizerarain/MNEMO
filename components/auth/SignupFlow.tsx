"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  Code,
  GraduationCap,
  Microscope,
  Rocket,
  Sparkles,
  Upload,
  FileText,
  Braces,
  Briefcase,
  Globe,
  Palette,
  HeartPulse,
  Landmark,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const INTERESTS = [
  { label: "Programming", icon: Braces },
  { label: "Business", icon: Briefcase },
  { label: "Science", icon: Microscope },
  { label: "Languages", icon: Globe },
  { label: "Design", icon: Palette },
  { label: "Health", icon: HeartPulse },
  { label: "Finance", icon: Landmark },
  { label: "History", icon: FileText },
];

const ROLES = [
  { key: "student", label: "Student", desc: "Learning & retaining course material", icon: GraduationCap },
  { key: "developer", label: "Developer", desc: "Docs, snippets & technical notes", icon: Code },
  { key: "researcher", label: "Researcher", desc: "Papers, findings & references", icon: Microscope },
  { key: "founder", label: "Founder", desc: "Ideas, strategy & market insight", icon: Rocket },
];

const IMPORT = [
  { key: "fresh", label: "Start fresh", desc: "Begin with a clean workspace", icon: Sparkles },
  { key: "paste", label: "I'll paste notes", desc: "Bring existing notes in via Capture", icon: Upload },
];

export function SignupFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<string[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [importPref, setImportPref] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  const totalSteps = 4;

  const toggleInterest = (label: string) =>
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );

  const canContinue =
    (step === 0 && interests.length > 0) ||
    (step === 1 && role) ||
    (step === 2 && importPref);

  async function createAccount(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { interests, role, import_pref: importPref } },
      });
      if (authError) throw authError;
      if (!data.session) {
        setConfirm("Check your email to confirm your account, then sign in.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-mnemo-primary to-[#4f2bb8]">
            <Brain className="h-5 w-5 text-white" />
          </span>
          <span className="text-lg font-semibold text-white">Mnemo Brain</span>
        </div>

        {/* Progress */}
        <div className="mb-8 flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-mnemo-primary to-mnemo-accent"
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.4 }}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <Step key="s0" title="What do you want to learn?" subtitle="Pick a few — Mnemo tailors your experience.">
              <div className="grid grid-cols-2 gap-2.5">
                {INTERESTS.map((it) => {
                  const on = interests.includes(it.label);
                  return (
                    <button
                      key={it.label}
                      onClick={() => toggleInterest(it.label)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm font-medium transition-all",
                        on
                          ? "border-mnemo-primary/50 bg-mnemo-primary/[0.1] text-white"
                          : "border-white/[0.08] text-mnemo-muted hover:border-white/20 hover:text-white"
                      )}
                    >
                      <it.icon className={cn("h-4 w-4", on && "text-mnemo-primary")} />
                      {it.label}
                    </button>
                  );
                })}
              </div>
            </Step>
          )}

          {step === 1 && (
            <Step key="s1" title="What best describes you?" subtitle="This helps Mnemo organize your knowledge.">
              <div className="space-y-2.5">
                {ROLES.map((r) => {
                  const on = role === r.key;
                  return (
                    <button
                      key={r.key}
                      onClick={() => setRole(r.key)}
                      className={cn(
                        "flex w-full items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all",
                        on
                          ? "border-mnemo-primary/50 bg-mnemo-primary/[0.1]"
                          : "border-white/[0.08] hover:border-white/20"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          on ? "bg-mnemo-primary/20 text-mnemo-primary" : "bg-white/5 text-mnemo-muted"
                        )}
                      >
                        <r.icon className="h-5 w-5" />
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{r.label}</p>
                        <p className="text-xs text-mnemo-muted">{r.desc}</p>
                      </div>
                      {on && <Check className="h-4 w-4 text-mnemo-primary" />}
                    </button>
                  );
                })}
              </div>
            </Step>
          )}

          {step === 2 && (
            <Step key="s2" title="Bring your knowledge in" subtitle="You can always import more later.">
              <div className="space-y-2.5">
                {IMPORT.map((im) => {
                  const on = importPref === im.key;
                  return (
                    <button
                      key={im.key}
                      onClick={() => setImportPref(im.key)}
                      className={cn(
                        "flex w-full items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all",
                        on
                          ? "border-mnemo-primary/50 bg-mnemo-primary/[0.1]"
                          : "border-white/[0.08] hover:border-white/20"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          on ? "bg-mnemo-primary/20 text-mnemo-primary" : "bg-white/5 text-mnemo-muted"
                        )}
                      >
                        <im.icon className="h-5 w-5" />
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{im.label}</p>
                        <p className="text-xs text-mnemo-muted">{im.desc}</p>
                      </div>
                      {on && <Check className="h-4 w-4 text-mnemo-primary" />}
                    </button>
                  );
                })}
              </div>
            </Step>
          )}

          {step === 3 && (
            <Step key="s3" title="Create your account" subtitle="One last step to your second brain.">
              {confirm ? (
                <div className="rounded-xl border border-mnemo-success/20 bg-mnemo-success/10 p-4 text-sm text-mnemo-success">
                  {confirm}{" "}
                  <Link href="/auth/login" className="font-medium underline">
                    Go to login
                  </Link>
                </div>
              ) : (
                <form onSubmit={createAccount} className="space-y-4">
                  <Field icon={Mail} type="email" label="Email" placeholder="you@example.com" value={email} onChange={setEmail} />
                  <Field icon={Lock} type="password" label="Password" placeholder="At least 6 characters" value={password} onChange={setPassword} />
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
                        Create account
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </Step>
          )}
        </AnimatePresence>

        {/* Nav buttons */}
        {step < 3 && (
          <div className="mt-8 flex items-center gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white transition-colors hover:border-white/25"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            )}
            <button
              onClick={() => canContinue && setStep((s) => s + 1)}
              disabled={!canContinue}
              className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-black transition-all hover:shadow-[0_0_28px_-6px_rgba(255,255,255,0.6)] disabled:opacity-40 disabled:hover:shadow-none"
            >
              Continue
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        )}

        {step === 3 && !confirm && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="mt-4 flex items-center gap-1.5 text-sm text-mnemo-muted hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        )}

        <p className="mt-6 text-center text-sm text-mnemo-muted">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-white hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Step({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
      <p className="mt-1.5 text-sm text-mnemo-muted">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </motion.div>
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
