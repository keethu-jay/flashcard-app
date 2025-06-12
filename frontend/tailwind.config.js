/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Define your custom font family here
      fontFamily: {
        jua: ['Jua', 'sans-serif'], // 'jua' will be the class name: font-jua
      },
      // You can also define custom colors if you don't want to use arbitrary values
      // colors: {
      //   'dark-gray': '#303030',
      //   'light-purple': '#9370DB',
      //   'off-white': '#F5F5DC',
      //   'bright-orange': '#FFA500',
      //   'darker-orange': '#FF8C00',
      //   'text-off-white': '#F8F8F8',
      // }
    },
  },
  plugins: [
    require('tailwindcss-nth-child') // Add the nth-child plugin here
  ],
}