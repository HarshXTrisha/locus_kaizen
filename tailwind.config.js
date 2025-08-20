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
          1: '#000000', // Black
          2: '#333333', // Dark Gray
        },
        accent: '#666666', // Medium Gray
        neutral: {
          light: '#F8F8F8', // Light gray background
          dark: '#1A1A1A', // Dark gray text
        },
        // Legacy color mappings for smooth transition
        'brand-teal': '#000000',
        'brand-navy': '#333333',
        'brand-blue': '#666666',
        'brand-bg': '#F8F8F8',
        'brand-text': '#1A1A1A',
      },
    },
  },
  plugins: [],
}
