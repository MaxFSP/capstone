import { nextui } from "@nextui-org/react";
import type { Config } from "tailwindcss";

const config = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // Ensures dark mode works via the 'dark' class
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      boxShadow: {
        outline: "0 0 0 2px rgba(255, 204, 0, 0.5)", // Caterpillar Yellow, semi-transparent
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))", // Use CSS variable for background
        foreground: "hsl(var(--foreground))", // Use CSS variable for text color
        primary: {
          DEFAULT: "hsl(var(--primary))", // Caterpillar Yellow
          foreground: "hsl(var(--primary-foreground))", // Caterpillar Black
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))", // Caterpillar Black
          foreground: "hsl(var(--secondary-foreground))", // Caterpillar White
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))", // Bright Red
          foreground: "hsl(var(--destructive-foreground))", // Caterpillar White
        },
        muted: {
          DEFAULT: "hsl(var(--muted))", // Light Gray
          foreground: "hsl(var(--muted-foreground))", // Dark Gray
        },
        accent: {
          DEFAULT: "hsl(var(--accent))", // Dark Gray
          foreground: "hsl(var(--accent-foreground))", // Caterpillar Yellow
        },
        popover: {
          DEFAULT: "hsl(var(--popover))", // Dark Gray
          foreground: "hsl(var(--popover-foreground))", // Caterpillar Yellow
        },
        card: {
          DEFAULT: "hsl(var(--card))", // Light Gray
          foreground: "hsl(var(--card-foreground))", // Caterpillar Black
        },
      },
      borderRadius: {
        lg: "0.5rem", // Border radius customization
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [nextui(), require("tailwindcss-animate")],
} satisfies Config;

export default config;
