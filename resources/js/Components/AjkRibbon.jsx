import React from 'react';

/**
 * A decorative ribbon displaying the AJK Flag tricolor motif:
 * Golden Saffron canton accent + alternating 4 green and 4 white stripes.
 */
export default function AjkRibbon({ className = 'h-1.5' }) {
    return (
        <div className={`w-full flex ${className} overflow-hidden`} aria-hidden="true">
            {/* Golden Saffron Canton Accent */}
            <div className="w-12 sm:w-24 bg-amber-500 flex-shrink-0" />
            
            {/* 8 Alternating Green & White Micro-Stripes Container */}
            <div className="flex-1 flex flex-col justify-between bg-[#046A38]">
                <div className="h-[25%] bg-white/95" />
                <div className="h-[25%] bg-white/95" />
            </div>

            {/* Trailing Gold Accent */}
            <div className="w-4 sm:w-8 bg-amber-400 flex-shrink-0" />
        </div>
    );
}
