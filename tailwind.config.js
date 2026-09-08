import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['"Noto Sans"', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                'pmcc-primary': '#0F3D2E',
                'pmcc-primary-dark': '#0A2921',
                'pmcc-accent': '#A8672A',
                'pmcc-accent-soft': '#F5EBDD',
                'pmcc-bg-citizen': '#FAFAF7',
                'pmcc-bg-staff': '#F6F7F6',
                'pmcc-surface': '#FFFFFF',
                'pmcc-border': '#E4E2DC',
                'pmcc-text-primary': '#171717',
                'pmcc-text-secondary': '#5A5A54',
                'pmcc-status-pending': '#8C8C86',
                'pmcc-status-investigation': '#A8672A',
                'pmcc-status-resolved': '#1F6F45',
                'pmcc-status-rejected': '#B3352A',
            },
        },
    },

    plugins: [forms],
};
