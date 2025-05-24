import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'space': ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        accent1: "hsl(var(--accent-1) / <alpha-value>)",
        accent2: "hsl(var(--accent-2) / <alpha-value>)",
        accent3: "hsl(var(--accent-3) / <alpha-value>)",
        accent4: "hsl(var(--accent-4) / <alpha-value>)",
      },
      animation: {
        morph: "morph 15s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
