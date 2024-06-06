/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#090c14",
        "workbench-panel-bg": "#0e0e11",
        "button-text": "#00cae0",
        "button-bg": "#e5ecff",
        border: "#073247",
        "cursor-bg": "#f2f5f7",
      },
    },
  },
  plugins: [],
};
