module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb', // основной цвет primary
          dark: '#1e40af',    // для hover/active
        },
      },
    },
  },
  plugins: [],
}; 