/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    /* ── Custom screens — xs added for sub-640px breakpoint ── */
    screens: {
      xs:  "480px",
      sm:  "640px",
      md:  "768px",
      lg:  "1024px",
      xl:  "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        ls: {
          bg:             "var(--ls-bg)",
          surface:        "var(--ls-surface)",
          "surface-2":    "var(--ls-surface-2)",
          text:           "var(--ls-text)",
          heading:        "var(--ls-heading)",
          muted:          "var(--ls-muted)",
          subtle:         "var(--ls-subtle)",
          border:         "var(--ls-border)",
          "border-strong":"var(--ls-border-strong)",
          green:          "var(--ls-green)",
          "green-light":  "var(--ls-green-light)",
          "green-dark":   "var(--ls-green-dark)",
          "green-soft":   "var(--ls-green-soft)",
          "green-hover":  "var(--ls-green-hover)",
          gold:           "var(--ls-gold)",
          red:            "var(--ls-red)",
          "red-light":    "var(--ls-red-light)",
          amber:          "var(--ls-amber)",
          "amber-light":  "var(--ls-amber-light)",
          neutral:        "var(--ls-neutral)",
          "neutral-light":"var(--ls-neutral-light)",
          page:           "var(--ls-page)",
          "on-green":     "var(--ls-on-green)",
          sidebar:        "var(--ls-sidebar)",
        },
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "Segoe UI", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        xs:   "var(--shadow-xs)",
        card: "var(--shadow-card)",
        md:   "var(--shadow-md)",
        lg:   "var(--shadow-lg)",
        xl:   "var(--shadow-xl)",
      },
      animation: {
        "fade-in":    "fadeIn 0.35s ease-out both",
        "fade-in-up": "fadeInUp 0.4s ease-out both",
        "slide-in":   "slideInLeft 0.3s ease-out both",
        "scale-in":   "scaleIn 0.22s ease-out both",
        "float":      "float 3s ease-in-out infinite",
      },
      maxWidth: {
        "8xl": "88rem",
      },
    },
  },
  plugins: [],
};
