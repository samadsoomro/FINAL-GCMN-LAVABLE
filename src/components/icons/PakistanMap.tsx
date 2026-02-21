import React from "react";

interface PakistanMapProps {
  className?: string;
  opacity?: number;
}

const PakistanMap: React.FC<PakistanMapProps> = ({
  className = "",
  opacity = 0.05,
}) => {
  return (
    <svg
      className={className}
      viewBox="0 0 500 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      {/* Simplified Pakistan Map Outline */}
      <path
        d="M 150 50
           L 200 45 L 250 55 L 300 60 L 350 70 L 380 90
           L 400 120 L 410 150 L 415 180 L 420 210
           L 425 240 L 428 270 L 430 300 L 428 330
           L 425 360 L 420 390 L 410 420 L 395 445
           L 375 465 L 350 480 L 320 490 L 285 495
           L 250 498 L 215 495 L 180 488 L 150 475
           L 125 458 L 105 435 L 90 408 L 80 378
           L 75 345 L 72 310 L 70 275 L 72 240
           L 75 205 L 82 170 L 92 135 L 108 100
           L 128 70 Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner detail lines */}
      <path
        d="M 150 200 Q 180 220 210 200"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M 250 150 Q 280 170 310 150"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M 200 350 Q 230 370 260 350"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
};

export default PakistanMap;
