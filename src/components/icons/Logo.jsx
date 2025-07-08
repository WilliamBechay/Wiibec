import React from 'react';

const Logo = ({ className = 'h-8 w-auto' }) => (
  <svg
    width="140"
    height="36"
    viewBox="0 0 140 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <radialGradient
        id="wiibec-gradient"
        cx="50%"
        cy="50%"
        r="50%"
        fx="50%"
        fy="50%"
      >
        <stop offset="0%" stopColor="#F2E797" />
        <stop offset="20%" stopColor="#EEEAAE" />
        <stop offset="50%" stopColor="#D0B972" />
        <stop offset="75%" stopColor="#A68147" />
        <stop offset="100%" stopColor="#825D2E" />
      </radialGradient>
    </defs>
    <text
      x="0"
      y="28"
      fontFamily="Trajan Pro, serif"
      fontSize="30"
      fontWeight="bold"
      fill="url(#wiibec-gradient)"
      letterSpacing="1"
    >
      WIIBEC
    </text>
  </svg>
);

export default Logo;