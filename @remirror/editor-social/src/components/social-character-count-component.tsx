import { useRemirrorTheme } from '@remirror/ui';
import React, { FC } from 'react';

export interface CharacterCountIndicatorProps {
  /**
   * An object describing the total characters and characters remaining
   */
  characters?: { total: number; used: number };
  size?: number;
  strokeWidth?: number;
  /** The number of characters remaining at which to display a warning */
  warningThreshold?: number;
}

const CharacterCountIndicatorComponent: FC<CharacterCountIndicatorProps> = ({
  characters = { total: 280, used: 290 },
  size = 27,
  strokeWidth = 3,
  warningThreshold = 18,
}) => {
  const { theme } = useRemirrorTheme();
  const { colors } = theme;
  const remainingCharacters = characters.total - characters.used;
  const warn = remainingCharacters <= warningThreshold;
  const ratio = characters.used / characters.total;
  const strokeColor = remainingCharacters < 0 ? colors.error : warn ? colors.warn : colors.primary!;

  // SVG centers the stroke width on the radius, subtract out so circle fits in square
  const radius = (size - strokeWidth) / 2;

  // Arc length at 100% coverage is the circle circumference
  const dashArray = radius * Math.PI * 2;

  // Scale 100% coverage overlay with the actual percent
  const dashOffset = dashArray - dashArray * (ratio > 1 ? 1 : ratio);

  return (
    <div style={{ marginLeft: 8, lineHeight: `${size}px`, display: 'flex' }}>
      {warn && (
        <div
          style={{
            color: remainingCharacters < 0 ? colors.error : colors.plain,
            marginRight: 4,
            paddingBottom: 0,
            backgroundColor: 'transparent',
            fontSize: '1em',
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
      style={{
        strokeDasharray: dashArray,
        strokeDashoffset: dashOffset,
        stroke: strokeColor,
        fill: 'none',
      }}
    />
  </svg>
);

export const CharacterCountIndicator = CharacterCountIndicatorComponent;
