/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 0 1px rgba(148, 163, 184, 0.08), 0 24px 80px rgba(15, 23, 42, 0.35)",
        soft: "0 12px 40px rgba(15, 23, 42, 0.18)",
      },
      colors: {
        accent: {
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
        },
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top, rgba(14,165,233,0.16), transparent 32%), linear-gradient(to right, rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.07) 1px, transparent 1px)",
      },
      backgroundSize: {
        "hero-grid": "auto, 72px 72px, 72px 72px",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
