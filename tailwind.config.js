/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand color palette
        brand: {
          primary: "#E68736",
          light: "#E6873633",
          dark: "#011632",
          orange: "#e48a3a",
          peach: "#fdeee0",
          peachLight: "#f6e6d7",
          gray: "#6b7280",
          grayDark: "#0f172a",
          border: "#e5e7eb",
          surface: "#f5f5f5",
        },
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        28: "7rem",
        32: "8rem",
        36: "9rem",
        48: "12rem",
        60: "15rem",
      },
      borderRadius: {
        12: "12px",
        14: "14px",
        18: "18px",
        falcon: "12px",
      },
      boxShadow: {
        sm: "0 1px 0 rgba(0,0,0,0.04)",
        md: "0 2px 10px rgba(0,0,0,0.05)",
        lg: "0 6px 18px rgba(15,23,42,0.06)",
        xl: "0 10px 30px rgba(15,23,42,0.08)",
        glow: "0 8px 28px rgba(228,138,58,0.12)",
        "orange-glow": "0 12px 35px rgba(230, 135, 54, 0.35)",
        header: "0 12px 40px rgba(15,23,42,0.12)",
        falcon: "0 4px 15px rgba(0,0,0,0.05)",
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "Avenir", "Helvetica", "Arial", "sans-serif"],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "1.5" }],
        sm: ["14px", { lineHeight: "1.5" }],
        base: ["16px", { lineHeight: "1.5" }],
        lg: ["18px", { lineHeight: "1.6" }],
        xl: ["20px", { lineHeight: "1.6" }],
        "2xl": ["24px", { lineHeight: "1.3" }],
        "3xl": ["32px", { lineHeight: "1.2" }],
        "4xl": ["40px", { lineHeight: "1.1" }],
        "5xl": ["48px", { lineHeight: "1" }],
      },
      animation: {
        "float": "floatY 6s ease-in-out infinite",
        "fade-in": "fadeIn 0.64s cubic-bezier(0.2,0.9,0.2,1)",
        "slide-up": "slideUp 0.64s cubic-bezier(0.2,0.9,0.2,1)",
      },
      keyframes: {
        floatY: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.2, 0.9, 0.2, 1)",
      },
    },
  },
  plugins: [],
}
