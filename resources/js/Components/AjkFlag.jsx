import React from 'react';

/**
 * Authentic SVG rendering of the Flag of Azad Jammu and Kashmir
 * Features:
 * - Golden Saffron canton in the upper hoist (representing religious minorities & Jammu heritage)
 * - Deep Kashmir emerald green field with white crescent & star
 * - 4 white and 4 green alternating stripes (representing the 4 rivers: Jhelum, Chenab, Poonch, Neelum)
 */
export default function AjkFlag({ className = 'w-10 h-7', rounded = 'rounded-md' }) {
    return (
        <svg
            viewBox="0 0 60 40"
            className={`${className} ${rounded} shadow-md overflow-hidden flex-shrink-0 border border-white/20`}
            aria-label="Flag of Azad Jammu and Kashmir"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <clipPath id="ajkFlagClip">
                    <rect width="60" height="40" rx="3" />
                </clipPath>
            </defs>
            <g clipPath="url(#ajkFlagClip)">
                {/* Upper Green Field */}
                <rect width="60" height="20" fill="#046A38" />

                {/* Saffron Gold Canton (Upper Hoist) */}
                <rect x="0" y="0" width="18" height="20" fill="#F49A11" />

                {/* White Crescent Moon */}
                <path
                    d="M 37.5 4.5 A 7 7 0 1 0 44 16.5 A 6 6 0 1 1 37.5 4.5 Z"
                    fill="#FFFFFF"
                />

                {/* White 5-pointed Star */}
                <polygon
                    points="44,7 45.2,9.8 48.2,9.8 45.8,11.5 46.7,14.3 44,12.5 41.3,14.3 42.2,11.5 39.8,9.8 42.8,9.8"
                    fill="#FFFFFF"
                />

                {/* Lower Half: 8 alternating stripes (4 Green, 4 White, 2.5px each) */}
                {/* Stripe 1: Green */}
                <rect x="0" y="20" width="60" height="2.5" fill="#046A38" />
                {/* Stripe 2: White */}
                <rect x="0" y="22.5" width="60" height="2.5" fill="#FFFFFF" />
                {/* Stripe 3: Green */}
                <rect x="0" y="25" width="60" height="2.5" fill="#046A38" />
                {/* Stripe 4: White */}
                <rect x="0" y="27.5" width="60" height="2.5" fill="#FFFFFF" />
                {/* Stripe 5: Green */}
                <rect x="0" y="30" width="60" height="2.5" fill="#046A38" />
                {/* Stripe 6: White */}
                <rect x="0" y="32.5" width="60" height="2.5" fill="#FFFFFF" />
                {/* Stripe 7: Green */}
                <rect x="0" y="35" width="60" height="2.5" fill="#046A38" />
                {/* Stripe 8: White */}
                <rect x="0" y="37.5" width="60" height="2.5" fill="#FFFFFF" />
            </g>
        </svg>
    );
}
