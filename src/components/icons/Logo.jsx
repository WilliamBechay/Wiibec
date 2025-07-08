import React from 'react';
import { useTheme } from '@/contexts/ThemeProvider';

const Logo = ({ className = 'h-8 w-auto' }) => {
  const { theme } = useTheme();

  const darkThemeGradientId = "wiibec-gradient-dark";
  const lightThemeGradientId = "wiibec-gradient-light";
  
  const currentGradientId = theme === 'light' ? lightThemeGradientId : darkThemeGradientId;

  return (
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
          id={darkThemeGradientId}
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
        <radialGradient
          id={lightThemeGradientId}
          cx="50%"
          cy="50%"
          r="50%"
          fx="50%"
          fy="50%"
        >
          <stop offset="0%" stopColor="#333333" />
          <stop offset="50%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
      </defs>
      <text
        x="0"
        y="28"
        fontFamily="Trajan Pro, serif"
        fontSize="30"
        fontWeight="bold"
        fill={`url(#${currentGradientId})`}
        letterSpacing="1"
      >
        WIIBEC
      </text>
    </svg>
  );
};

export default Logo;