/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', '"Times New Roman"', 'serif'],
        serif:   ['"Playfair Display"', 'Georgia', '"Times New Roman"', 'serif'],
        body:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        /* Light (B) */
        offwhite:  '#F6F7F9',
        /* Dark (C — Warm Zinc) */
        zinc:      '#131311',
        zincsurface: '#1F1F1D',
        zincinput: '#282826',
        /* Brand */
        redbrand:  '#DC2626',
        redhover:  '#B91C1C',
        /* Premium */
        gold:      '#CA8A04',
        goldark:   '#F5A623',
      },
      boxShadow: {
        glow:   '0 0 35px rgba(220,38,38,0.22)',
        'glow-sm': '0 0 18px rgba(220,38,38,0.16)',
        card:   '0 18px 50px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
};
