import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        stage: {
          applied: "hsl(var(--stage-applied))",
          screening: "hsl(var(--stage-screening))",
          interview: "hsl(var(--stage-interview))",
          offer: "hsl(var(--stage-offer))",
          closed: "hsl(var(--stage-closed))",
        },
        // Legacy brand palette (content screens still use these)
        main: {
          DEFAULT: "#55527c",
          50: "#f8f7fc",
          100: "#f0eef8",
          200: "#e1ddf0",
          300: "#cbc4e3",
          400: "#b0a5d2",
          500: "#55527c",
          600: "#4a4570",
          700: "#3e3a5f",
          800: "#332f4e",
          900: "#28243d",
        },
        dark: {
          DEFAULT: "#130f49",
          50: "#f5f4fd",
          100: "#ebe9fb",
          200: "#d7d3f6",
          300: "#b9b2ee",
          400: "#9489e3",
          500: "#6b5dd7",
          600: "#5a47c9",
          700: "#4c3ab0",
          800: "#3f2f91",
          900: "#130f49",
        },
        yellow: {
          DEFAULT: "#ff972d",
          50: "#fff8f0",
          100: "#ffeed6",
          200: "#ffdbac",
          300: "#ffc177",
          400: "#ffa041",
          500: "#ff972d",
          600: "#f0850f",
          700: "#c76b08",
          800: "#9e540c",
          900: "#80450d",
        },
        blue: {
          DEFAULT: "#a5a6ff",
          50: "#f0f0ff",
          100: "#e5e5ff",
          200: "#d1d2ff",
          300: "#a5a6ff",
          400: "#8b8cff",
          500: "#6b6dff",
          600: "#4f51ff",
          700: "#3b3dff",
          800: "#2f31e6",
          900: "#1f21b3",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      fontFamily: {
        sans: [
          "Geist Sans",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        inter: ["Inter", "sans-serif"],
        karla: ["Karla", "sans-serif"],
        kristi: ["Kristi", "cursive"],
      },
      fontSize: {
        display: [
          "28px",
          { lineHeight: "32px", letterSpacing: "-0.02em", fontWeight: "600" },
        ],
        h1: [
          "20px",
          { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        h2: ["16px", { lineHeight: "24px", fontWeight: "600" }],
        h3: ["14px", { lineHeight: "20px", fontWeight: "600" }],
        body: ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "18px", fontWeight: "400" }],
        caption: [
          "12px",
          { lineHeight: "16px", letterSpacing: "0.01em", fontWeight: "500" },
        ],
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        expand: "expandHeight 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        expandHeight: {
          "0%": { maxHeight: "0", opacity: "0" },
          "100%": { maxHeight: "2000px", opacity: "1" },
        },
      },
      boxShadow: {
        "dark-lg":
          "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
        "dark-xl":
          "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
        portfolio: "30px 40px 80px #e4edf5",
        "portfolio-dark": "30px 40px 80px rgba(0, 0, 0, 0.4)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
