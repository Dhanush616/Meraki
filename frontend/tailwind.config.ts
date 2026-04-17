import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: ["class"],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1200px",
            },
        },
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // Core palette
                parchment: "#faf9f7",
                ivory: "#ffffff",
                brand: "#c96442",
                "near-black": "#000000",
                "dark-surface": "#30302e",
                // Text
                "olive-gray": "#9f9b93",
                "warm-silver": "#9f9b93",
                "warm-charcoal": "#55534e",
                "dark-charcoal": "#333333",
                "stone-gray": "#9f9b93",
                // Borders & surfaces
                "border-cream": "#dad4c8",
                "oat-border": "#dad4c8",
                "oat-light": "#eee9df",
                "warm-sand": "#eee9df",
                // Swatch palette (Clay design system)
                "matcha-300": "#84e7a5",
                "matcha-600": "#078a52",
                "matcha-800": "#02492a",
                "slushie-500": "#3bd3fd",
                "slushie-800": "#0089ad",
                "lemon-400": "#f8cc65",
                "lemon-500": "#fbbd41",
                "lemon-700": "#d08a11",
                "ube-300": "#c1b0ff",
                "ube-800": "#43089f",
                "pomegranate-400": "#fc7981",
                "blueberry-800": "#01418d",
            },
            fontFamily: {
                serif: ["Georgia", "serif"],
                sans: ["Inter", "sans-serif"],
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
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
    plugins: [require("tailwindcss-animate")],
}

export default config
