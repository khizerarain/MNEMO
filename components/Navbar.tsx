"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/capture", label: "Capture" },
  { href: "/graph", label: "Graph" },
  { href: "/quiz", label: "Quiz" },
  { href: "/chat", label: "Chat" },
];

export function Navbar() {
  const pathname = usePathname();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <nav className="border-b border-mnemo-border bg-mnemo-surface sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="font-display text-lg font-semibold tracking-tight">
            MNEMO
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? "text-mnemo-text bg-mnemo-background font-medium"
                      : "text-mnemo-muted hover:text-mnemo-text"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-mnemo-muted hover:text-mnemo-text hover:bg-transparent"
          >
            Sign out
          </Button>
        </div>
      </div>
    </nav>
  );
}
