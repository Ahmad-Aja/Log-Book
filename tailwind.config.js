/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/views/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: {
        // poppins: ["var(--font-poppins)", "sans-serif"],
        // itfQomraArabic: ["var(--font-itfQomraArabic)", "sans-serif"],
      },
      colors: {
        /* Golden Wheat */
        "wheat-dark": "#988561",
        wheat: "#b9a779",
        "wheat-light": "#edebe0",

        /* Forest */
        "forest-deep": "#002623",
        forest: "#054239",
        "forest-light": "#428177",

        /* Charcoal */
        "charcoal-dark": "#161616",
        charcoal: "#3d3a3b",
        "charcoal-light": "#ffffff",

        /* Deep Umber */
        "umber-deep": "#260f14",
        umber: "#4a151e",
        "umber-light": "#6b1f2a",

        darkBg: "#161616",
        darkMain: "#2f3349",
        darkHover: "#3d4056",
        darkFont: "#d0cde4",
        lightBg: "#f8f7fa",
        lightMain: "#ffffff",
        lightHover: "#e9e7ee",
        lightFont: "#434050",

        success: "#48BB78",
        warning: "#ED8936",
        error: "#E53E3E",
        info: "#4299E1",
        gold: "#ECC94B",
      },
      screens: {
        sm: "500px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
