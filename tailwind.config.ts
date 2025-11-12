import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        felt: {
          light: "#2a5934",
          DEFAULT: "#1a4024",
          dark: "#0f2616",
        },
      },
      animation: {
        'deal-card': 'deal 0.3s ease-out forwards',
        'flip-card': 'flip 0.4s ease-in-out forwards',
      },
      keyframes: {
        deal: {
          '0%': { transform: 'translate(-100vw, -100vh) rotate(-15deg)', opacity: '0' },
          '100%': { transform: 'translate(0, 0) rotate(0)', opacity: '1' },
        },
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
