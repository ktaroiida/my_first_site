/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: { background: '#F8FAFC', primary: '#1E293B' },
            fontFamily: { sans: ['Inter', 'Noto Sans JP', 'sans-serif'] },
        },
    },
    plugins: [],
}
