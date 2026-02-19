/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#151F2E",
          secondary: "#2462C7",
          success: "#2462C7",
          warning: "#2462C7",
          danger: "#151F2E"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)"
      },
      animation: {
        "pulse-soft": "pulseSoft 1s ease-in-out infinite"
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.65" }
        }
      }
    }
  },
  plugins: []
};

