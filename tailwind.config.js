/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        todoist: {
          red: "#dc4c3e",
          "red-hover": "#c53727",
          bg: "#fafafa",
          sidebar: "#fcfaf8",
          "sidebar-hover": "#f5f3f0",
          border: "#f0eded",
          "text-primary": "#202020",
          "text-secondary": "#808080",
          "text-tertiary": "#aaaaaa",
          "priority-1": "#d1453b",
          "priority-2": "#eb8909",
          "priority-3": "#246fe0",
          "priority-4": "#808080",
        },
      },
      fontSize: {
        13: "13px",
        14: "14px",
      },
    },
  },
  plugins: [],
};
