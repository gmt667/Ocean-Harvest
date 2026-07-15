import React from "react";
import { useApp } from "../context/AppContext";

interface OceanHarvestLogoProps {
  className?: string;
  color?: string;
  size?: number;
}

export const OceanHarvestLogo: React.FC<OceanHarvestLogoProps> = ({
  className = "",
  color,
  size
}) => {
  const { settings } = useApp();
  const fillSource = color || settings?.primaryColor || "#15803d"; // Default green if no context/prop

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Dynamic mask to create a true transparent cutout in the hull */}
        <mask id="hull-cutout-mask">
          <rect x="0" y="0" width="100" height="100" fill="white" />
          {/* Transparent cutout path (styled like a dynamic highlight curve) */}
          <path
            d="M 45,41 C 55,34 61,31 64,30 C 60,33 51,38 45,41 Z"
            fill="black"
          />
        </mask>
      </defs>

      {/* 1. Mast */}
      <rect
        x="48.5"
        y="17"
        width="3"
        height="18"
        rx="0.5"
        fill={fillSource}
      />

      {/* 2. Boat Hull (with mask applied for true transparent highlight) */}
      <path
        d="M 36,45 L 68,25 C 70,32 70,44 67,53 C 55,58 45,55 36,51 Z"
        fill={fillSource}
        mask="url(#hull-cutout-mask)"
      />

      {/* 3. Wave 1 (Top Wave) */}
      <path
        d="M 28,54 C 33,50 41,50 50,52 C 60,54 68,58 75,66 C 68,61 59,59 50,59 C 41,59 34,57 28,54 Z"
        fill={fillSource}
      />

      {/* 4. Wave 2 (Middle Wave) */}
      <path
        d="M 29,61 C 34,57 42,57 50,59 C 59,61 67,65 73,73 C 66,68 58,66 50,66 C 41,66 34,64 29,61 Z"
        fill={fillSource}
      />

      {/* 5. Wave 3 (Bottom Wave) */}
      <path
        d="M 35,69 C 39,66 45,66 51,68 C 58,70 65,73 71,80 C 65,76 58,74 51,74 C 44,74 39,72 35,69 Z"
        fill={fillSource}
      />
    </svg>
  );
};
