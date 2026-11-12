import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "mtn-yellow": "#FFCB05",
        "mtn-black": "#000000",
        "mtn-dark": "#1F1F1F",
        "mtn-light": "#F4F4F4"
      },
      fontFamily: {
        sans: ['"MTN Brighter Sans"', "Arial", '"Helvetica Neue"', "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;