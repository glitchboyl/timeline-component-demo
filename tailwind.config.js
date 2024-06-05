/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "workbench-panel-bg": "#0e0e11",
        "button-text": "#00cae0",
        "button-bg": "#e5ecff",
        border: "#073247",
      },
    },
  },
  plugins: [],
};
