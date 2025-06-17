/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        jua: ['Jua', 'sans-serif'],
        nunito: ['"Nunito Sans"', 'sans-serif'],
      },
      colors: {
        'light-grey': '#404040' ,
        'dark-grey': '#303030',
        'purple': '#9370DB',
        'orange': '#FFA500',
        'orange-hover': '#FF8C00',
        'off-white': '#F5F5DC',
        'teal': '#00ba92',
        'light-blue':'#006d91',
        'dark-blue': '#202854',

      },
    },
  },
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  plugins: [],
}