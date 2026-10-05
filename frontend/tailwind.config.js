/** @type {import('tailwindcss').Config} */
export default {
  // `ts`/`tsx` are included as well: `npx shadcn add` generates typed
  // component files even in this JS project, and Tailwind only emits
  // utilities for classes it can actually see in a scanned file.
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#fff7f3',
        blush: '#f7dfe9',
        blushDeep: '#e9b4c8',
        blueMist: '#dfeaf8',
        butter: '#f9efbd',
        sage: '#dfe9d8',
        cocoa: '#7d5a45',
        ink: '#2c1e1f',
      },
      boxShadow: {
        soft: '0 18px 40px rgba(64, 42, 45, 0.08)',
      },
      fontFamily: {
        display: ['"Segoe UI"', 'sans-serif'],
      },
    },
  },
  plugins: [],

  // Preflight is intentionally OFF. Yarnberri is a Bootstrap project:
  // Bootstrap's reboot owns element defaults (heading scale, list
  // markers, link colours) and 5,300+ lines of crochet.css were written
  // against it. Preflight would reset all of that out from under the
  // existing pages.
  //
  // Without preflight, `border-style: solid` has to come from somewhere -
  // it is the CSS initial value `none`, so Tailwind's `border-width: 1px`
  // utility would render no visible border at all. globals.css supplies
  // that one declaration, and nothing else from preflight is needed.
  corePlugins: {
    preflight: false,
  },
};
