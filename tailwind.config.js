/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // or 'selector' in v4, but 'class' is often aliased or supported
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-outfit)'],
            },
        },
    },
    plugins: [],
}
