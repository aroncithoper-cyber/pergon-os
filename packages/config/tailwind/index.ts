import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config = {
  darkMode: ["class"],
  content: [],
  theme: {
    container: {
      center: true,
      padding: "var(--container-padding)",
      screens: {
        "2xl": "var(--container-max)",
      },
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1440px",
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        xs: ["var(--font-size-xs)", { lineHeight: "var(--line-height-normal)" }],
        sm: ["var(--font-size-sm)", { lineHeight: "var(--line-height-normal)" }],
        base: ["var(--font-size-base)", { lineHeight: "var(--line-height-normal)" }],
        lg: ["var(--font-size-lg)", { lineHeight: "var(--line-height-snug)" }],
        xl: ["var(--font-size-xl)", { lineHeight: "var(--line-height-snug)" }],
        "2xl": ["var(--font-size-2xl)", { lineHeight: "var(--line-height-tight)" }],
        "3xl": ["var(--font-size-3xl)", { lineHeight: "var(--line-height-tight)" }],
        "4xl": ["var(--font-size-4xl)", { lineHeight: "var(--line-height-tight)" }],
        display: ["var(--font-size-display)", { lineHeight: "var(--line-height-tight)" }],
        "display-l": ["var(--font-size-display-l)", { lineHeight: "var(--line-height-tight)" }],
        "display-xl": ["var(--font-size-display-xl)", { lineHeight: "var(--line-height-tight)" }],
        "display-xxl": ["var(--font-size-display-xxl)", { lineHeight: "var(--line-height-tight)" }],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        panel: {
          DEFAULT: "hsl(var(--panel))",
          foreground: "hsl(var(--panel-foreground))",
        },
        elevated: {
          DEFAULT: "hsl(var(--elevated))",
          foreground: "hsl(var(--elevated-foreground))",
        },
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
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
        signal: {
          DEFAULT: "hsl(var(--signal))",
          foreground: "hsl(var(--signal-foreground))",
        },
        cyan: {
          DEFAULT: "hsl(var(--cyan))",
          foreground: "hsl(var(--cyan-foreground))",
        },
        carbon: "hsl(var(--carbon))",
        graphite: "hsl(var(--graphite))",
        steel: "hsl(var(--steel))",
        electric: "hsl(var(--electric))",
        glass: "hsl(var(--glass))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        none: "var(--radius-none)",
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
      boxShadow: {
        "pergon-xs": "var(--shadow-xs)",
        "pergon-sm": "var(--shadow-sm)",
        "pergon-md": "var(--shadow-md)",
        "pergon-lg": "var(--shadow-lg)",
        "pergon-overlay": "var(--shadow-overlay)",
        "pergon-signal": "var(--shadow-signal)",
        "pergon-depth": "var(--shadow-depth)",
        "pergon-glow": "var(--shadow-glow)",
      },
      spacing: {
        "4.5": "1.125rem",
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        6: "var(--space-6)",
        8: "var(--space-8)",
        12: "var(--space-12)",
        16: "var(--space-16)",
        24: "var(--space-24)",
        32: "var(--space-32)",
        navbar: "var(--navbar-height)",
        sidebar: "var(--sidebar-width)",
        "sidebar-collapsed": "var(--sidebar-width-collapsed)",
      },
      zIndex: {
        raised: "var(--z-raised)",
        sticky: "var(--z-sticky)",
        dropdown: "var(--z-dropdown)",
        overlay: "var(--z-overlay)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
        tooltip: "var(--z-tooltip)",
      },
      transitionDuration: {
        micro: "var(--duration-micro)",
        ui: "var(--duration-ui)",
        panel: "var(--duration-panel)",
        section: "var(--duration-section)",
      },
      transitionTimingFunction: {
        "pergon-out": "var(--ease-out)",
        "pergon-in": "var(--ease-in)",
        "pergon-inout": "var(--ease-inout)",
      },
      keyframes: {
        "pergon-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
        "pergon-aurora": {
          "0%": { transform: "translate3d(-2%, -1%, 0) scale(1)", opacity: "0.7" },
          "100%": { transform: "translate3d(3%, 2%, 0) scale(1.08)", opacity: "1" },
        },
        "pergon-scroll-cue": {
          "0%, 100%": { transform: "translateY(0)", opacity: "0.55" },
          "50%": { transform: "translateY(6px)", opacity: "1" },
        },
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
        "pergon-pulse": "pergon-pulse 1.4s ease-in-out infinite",
        "pergon-aurora": "pergon-aurora 14s var(--ease-inout) infinite alternate",
        "pergon-scroll-cue": "pergon-scroll-cue 2s var(--ease-inout) infinite",
        "accordion-down": "accordion-down var(--duration-ui) var(--ease-out)",
        "accordion-up": "accordion-up var(--duration-ui) var(--ease-in)",
      },
    },
  },
  plugins: [animate],
} satisfies Config;

export default config;
