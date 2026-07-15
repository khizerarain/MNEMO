import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "var(--font-inter)",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "var(--font-geist-sans)",
          "var(--font-inter)",
          "system-ui",
          "sans-serif",
        ],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        mnemo: {
          background: "var(--background)",
          bg: "var(--background)",
          surface: "var(--card)",
          card: "var(--card)",
          border: "var(--border)",
          primary: "var(--primary)",
          accent: "var(--accent)",
          text: "var(--foreground)",
          muted: "var(--muted-foreground)",
          success: "#22c55e",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        "marquee-reverse": "marquee 45s linear infinite reverse",
        aurora: "aurora 18s ease-in-out infinite alternate",
        "aurora-slow": "aurora 26s ease-in-out infinite alternate",
        float: "float 8s ease-in-out infinite",
        "float-delayed": "float 10s ease-in-out infinite 1s",
        shimmer: "shimmer 2.5s linear infinite",
        "border-beam": "border-beam calc(var(--duration,6s)) infinite linear",
        "spin-slow": "spin 24s linear infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "gradient-x": "gradient-x 6s ease infinite",
        "fade-in": "fade-in 0.6s ease forwards",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        aurora: {
          "0%": { transform: "translate(0%, 0%) rotate(0deg) scale(1)" },
          "50%": { transform: "translate(4%, -3%) rotate(8deg) scale(1.15)" },
          "100%": { transform: "translate(-3%, 4%) rotate(-6deg) scale(1.05)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "border-beam": {
          "100%": { offsetDistance: "100%" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
