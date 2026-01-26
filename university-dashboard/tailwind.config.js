/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#F8FAFC',
                primary: '#1E293B',
                male: '#3B82F6',
                female: '#F43F5E',
            },
            fontFamily: {
                sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
