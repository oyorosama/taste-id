import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Dynamic accent color via CSS variable
                accent: {
                    DEFAULT: "hsl(var(--accent) / <alpha-value>)",
                    light: "hsl(var(--accent-light) / <alpha-value>)",
                    dark: "hsl(var(--accent-dark) / <alpha-value>)",
                },
                // Neutral palette
                surface: {
                    DEFAULT: "hsl(var(--surface) / <alpha-value>)",
                    raised: "hsl(var(--surface-raised) / <alpha-value>)",
                    overlay: "hsl(var(--surface-overlay) / <alpha-value>)",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            spacing: {
                "18": "4.5rem",
                "88": "22rem",
            },
            animation: {
                "fade-in": "fadeIn 0.3s ease-out",
                "slide-up": "slideUp 0.4s ease-out",
                "scale-in": "scaleIn 0.2s ease-out",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                scaleIn: {
                    "0%": { opacity: "0", transform: "scale(0.95)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
            },
            backdropBlur: {
                xs: "2px",
            },
        },
    },
    plugins: [],
};

export default config;
