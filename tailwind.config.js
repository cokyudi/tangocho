/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        fg: 'var(--fg)',
        accent: 'var(--accent)',
        'on-accent': 'var(--on-accent)',
        highlight: 'var(--highlight)',
        muted: 'var(--muted)',
      },
      boxShadow: {
        'retro-sm': '2px 2px 0 0 var(--shadow)',
        retro: '4px 4px 0 0 var(--shadow)',
        'retro-lg': '6px 6px 0 0 var(--shadow)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'var(--font-noto-sans-jp)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'var(--font-geist-sans)', 'ui-sans-serif', 'sans-serif'],
        jp: ['var(--font-noto-sans-jp)', 'var(--font-geist-sans)', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'var(--fg)',
            '--tw-prose-headings': 'var(--fg)',
            '--tw-prose-links': 'var(--accent)',
            '--tw-prose-bold': 'var(--ink)',
            '--tw-prose-bullets': 'var(--ink)',
            '--tw-prose-hr': 'var(--ink)',
            '--tw-prose-quotes': 'var(--ink)',
            '--tw-prose-quote-borders': 'var(--accent)',
            '--tw-prose-code': 'var(--ink)',
            '--tw-prose-th-borders': 'var(--ink)',
            '--tw-prose-td-borders': 'var(--ink)',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
