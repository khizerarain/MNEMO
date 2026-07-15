import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { AuthShowcase } from "@/components/auth/AuthShowcase";
import { LoginForm } from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="app-root grid min-h-screen font-sans lg:grid-cols-2">
      <AuthShowcase />
      <LoginForm />
    </div>
  );
}
