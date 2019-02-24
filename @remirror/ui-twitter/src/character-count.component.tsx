import React, { FC } from 'react';

export interface CharacterCountIndicatorProps {
  /** An object describing the total characters and characters remaining */
  characters?: { total: number; used: number };
  size?: number;
  strokeWidth?: number;
  /** The number of characters remaining at which to display a warning */
  warningThreshold?: number;
}

export const CharacterCountIndicator: FC<CharacterCountIndicatorProps> = ({
  characters = { total: 280, used: 290 },
  size = 20,
  strokeWidth = 2,
  warningThreshold = 18,
}) => {
  const remainingCharacters = characters.total - characters.used;
  const warn = remainingCharacters <= warningThreshold;
  const ratio = characters.used / characters.total;
  const strokeColor = remainingCharacters < 0 ? '#e0245e' : warn ? '#ffad1f' : '#1da1f2';

  // SVG centers the stroke width on the radius, subtract out so circle fits in square
  const radius = (size - strokeWidth) / 2;

  // Arc length at 100% coverage is the circle circumference
  const dashArray = radius * Math.PI * 2;

  // Scale 100% coverage overlay with the actual percent
  const dashOffset = dashArray - dashArray * (ratio > 1 ? 1 : ratio);

  return (
    <div style={{ marginLeft: 8, lineHeight: '20px' }}>
      {warn && (
        <div
          style={{
            color: remainingCharacters < 0 ? '#e0245e' : '#657786',
            marginRight: 4,
            paddingBottom: 0,
            backgroundColor: 'transparent',
            fontSize: 14,
            display: 'inline-block',
          }}
        >
          {remainingCharacters}
        </div>
      )}
      <CharacterCountCircle
        dashArray={dashArray}
        dashOffset={dashOffset}
        radius={radius}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        size={size}
      />
    </div>
  );
};

interface CharacterCountCircleProps {
  size: number;
  radius: number;
  strokeWidth: number;
  strokeColor: string;
  dashArray: number;
  dashOffset: number;
}

const CharacterCountCircle: FC<CharacterCountCircleProps> = ({
  size,
  radius,
  strokeWidth,
  strokeColor,
  dashArray,
  dashOffset,
}) => (
  <svg
    width={size}
    height={size}
    // viewBox={`0 0 ${size} ${size}`}
    style={{ marginBottom: -4, overflow: 'visible', transform: 'rotate(-90deg)' }}
  >
    <circle
      className='circle-background'
      cx={size / 2}
      cy={size / 2}
      r={radius}
      strokeWidth={`${strokeWidth / 2}px`}
      style={{ stroke: '#ccd6dd', fill: 'none' }}
    />
    <circle
      className='circle-progress'
      cx={size / 2}
      cy={size / 2}
      r={radius}
      strokeWidth={`${strokeWidth}px`}
      // Start progress marker at 12 O'Clock
      // transform={`rotate(-90 ${size / 2} ${size / 2})`}
      style={{
        strokeDasharray: dashArray,
        strokeDashoffset: dashOffset,
        stroke: strokeColor,
        fill: 'none',
      }}
    />
  </svg>
);
