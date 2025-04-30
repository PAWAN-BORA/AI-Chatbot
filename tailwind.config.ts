import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primarygray: "var(--primarygray)",
        primaryyellow: "var(--primaryyellow)",
        codebg: "var(--codebg)",
        success: "var(--success)",
        error: "var(--error)",
        menubg: "var(--menubg)",
        menufg: "var(--menufg)",
      },
    },
  },
  plugins: [],
} satisfies Config;
