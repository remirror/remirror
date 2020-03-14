/** @jsx jsx */
import { jsx } from '@emotion/core';

import { numberToPixels, useRemirrorTheme } from '@remirror/ui';

import { defaultDropCursorExtensionOptions } from './drop-cursor-constants';
import { DropCursorExtensionComponentProps, DropCursorExtensionOptions } from './drop-cursor-types';

type DropCursorComponentProps = Omit<DropCursorExtensionComponentProps, 'options'> & {
  options: DropCursorExtensionOptions;
};

export const DropCursorComponent = ({ options, type, container }: DropCursorComponentProps) => {
  const { sx } = useRemirrorTheme();

  const { Component, ...rest } = options;

  return Component ? (
    <Component options={rest as any} type={type} container={container} />
  ) : type === 'block' ? (
    <div
      css={sx({
        width: numberToPixels(rest.blockWidth ?? defaultDropCursorExtensionOptions.blockWidth),
        backgroundColor: rest.color ?? defaultDropCursorExtensionOptions.color,
        height: numberToPixels(rest.blockHeight ?? defaultDropCursorExtensionOptions.blockHeight),
      })}
    />
  ) : (
    <span
      css={sx({
        display: 'inline',
        backgroundColor: rest.color,
        borderRadius: 0,
        margin: `0 ${numberToPixels(rest.inlineSpacing ?? defaultDropCursorExtensionOptions.inlineSpacing)}`,
        width: numberToPixels(rest.inlineWidth ?? defaultDropCursorExtensionOptions.inlineWidth),
      })}
    >
      &nbsp;
    </span>
  );
};
