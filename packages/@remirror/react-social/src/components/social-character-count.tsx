import { css } from 'linaria';
import { styled } from 'linaria/react';
import React, { FC } from 'react';

export interface SocialCharacterCountProps {
  /**
   * An object describing the total characters and characters remaining
   */
  characters?: { maximum: number; used: number };
  size?: number;
  strokeWidth?: number;
  /** The number of characters remaining at which to display a warning */
  warningThreshold?: number;
}

const colors = {
  primary: '#1DA1F2',
  warn: '#FFAD1F',
  error: '#E0245E',
  plain: '#657786',
};

export const SocialCharacterCount: FC<SocialCharacterCountProps> = (props) => {
  const {
    characters = { maximum: 280, used: 290 },
    size = 27,
    strokeWidth = 3,
    warningThreshold = 18,
  } = props;

  const remainingCharacters = characters.maximum - characters.used;
  const warn = remainingCharacters <= warningThreshold;
  const ratio = characters.used / characters.maximum;
  const strokeColor = remainingCharacters < 0 ? colors.error : warn ? colors.warn : colors.primary;

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

const CharacterCountCircle: FC<CharacterCountCircleProps> = (props) => {
  const { size, radius, strokeWidth, strokeColor, dashArray, dashOffset } = props;

  return (
    <svg width={size} height={size} className={characterCountCircleWrapperStyles}>
      <circle
        className={characterCountCircleBackgroundStyles}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={`${strokeWidth / 2}px`}
      />
      <circle
        className={characterCountCircleStyles}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={`${strokeWidth}px`}
        style={{
          strokeDasharray: dashArray,
          strokeDashoffset: dashOffset,
          stroke: strokeColor,
        }}
      />
    </svg>
  );
};

/**
 * This component is used to wrap the social character count component and
 * positions it absolutely relative to the first parent with a `position:
 * relative`.
 */
export const SocialCharacterCountWrapper = styled.div`
  position: absolute;
  bottom: 0px;
  right: 0px;
  margin: 0 8px 10px 4px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const characterCountCircleBackgroundStyles = css`
  stroke: #ccd6dd;
  fill: none;
`;

const characterCountCircleStyles = css`
  fill: none;
`;

const characterCountCircleWrapperStyles = css`
  margin-bottom: -4px;
  overflow: visible;
  transform: rotate(-90deg);
`;
