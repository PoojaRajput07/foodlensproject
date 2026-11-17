/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ls: {
          bg: "var(--ls-bg)",
          surface: "var(--ls-surface)",
          text: "var(--ls-text)",
          muted: "var(--ls-muted)",
          border: "var(--ls-border)",
          green: "var(--ls-green)",
          "green-light": "var(--ls-green-light)",
          red: "var(--ls-red)",
          "red-light": "var(--ls-red-light)",
          amber: "var(--ls-amber)",
          "amber-light": "var(--ls-amber-light)",
          neutral: "var(--ls-neutral)",
          "neutral-light": "var(--ls-neutral-light)",
          page: "var(--ls-page)",
          "on-green": "var(--ls-on-green)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 32, 26, 0.04)",
      },
    },
  },
  plugins: [],
};
