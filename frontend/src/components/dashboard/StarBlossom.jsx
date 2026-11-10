import React from 'react';

/**
 * StarBlossom — 4-Pointed Iridescent Star SVG Blossom
 * SETO visual language emblem representing rural opportunity & statutory enterprise.
 * Uses keyframe pulse and multi-stop iridescent radial gradients.
 */
export default function StarBlossom({ className = 'iris-star-svg', size = 58 }) {
  return (
    <div className="flex items-center justify-center select-none" aria-hidden="true">
      <svg 
        className={className} 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE4D6" />
            <stop offset="45%" stopColor="#E86043" />
            <stop offset="75%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#F59E0B" />
          </radialGradient>
        </defs>
        <path 
          d="M50 0 C50 30 70 50 100 50 C70 50 50 70 50 100 C50 70 30 50 0 50 C30 50 50 30 50 0 Z" 
          fill="url(#starGlow)" 
          opacity="0.9" 
        />
        <circle cx="50" cy="50" r="10" fill="#FFFFFF" opacity="0.85" filter="blur(2px)" />
      </svg>
    </div>
  );
}
