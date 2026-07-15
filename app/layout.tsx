import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = "https://mnemo.ai";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mnemo Brain — Your Second Brain, Powered by AI",
    template: "%s · Mnemo Brain",
  },
  description:
    "Capture ideas, organize knowledge, and retrieve information instantly with intelligent memory. Never lose a thought again.",
  keywords: [
    "AI second brain",
    "knowledge management",
    "personal knowledge base",
    "AI memory",
    "note taking",
    "knowledge graph",
    "semantic search",
  ],
  authors: [{ name: "Mnemo Brain" }],
  creator: "Mnemo Brain",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Mnemo Brain",
    title: "Mnemo Brain — Your Second Brain, Powered by AI",
    description:
      "Capture ideas, organize knowledge, and retrieve information instantly with intelligent memory. Never lose a thought again.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mnemo Brain — Your Second Brain, Powered by AI",
    description:
      "Capture ideas, organize knowledge, and retrieve information instantly with intelligent memory.",
    creator: "@mnemobrain",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${inter.variable} font-sans antialiased bg-mnemo-background text-mnemo-text min-h-screen transition-colors duration-300`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
