/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          1: '#2EC4B6', // Teal
          2: '#21356B', // Navy
        },
        accent: '#4A90E2', // Bright Blue
        neutral: {
          light: '#F4F7F9', // Light grey-blue background
          dark: '#2F3542', // Soft black/dark grey text
        },
        // Legacy color mappings for smooth transition
        'brand-teal': '#2EC4B6',
        'brand-navy': '#21356B',
        'brand-blue': '#4A90E2',
        'brand-bg': '#F4F7F9',
        'brand-text': '#2F3542',
      },
    },
  },
  plugins: [],
}
