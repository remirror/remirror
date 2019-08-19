import { numberToPixels, useRemirrorTheme } from '@remirror/ui';
import { DropCursorExtensionComponentProps, DropCursorExtensionOptions } from './drop-cursor-types';

type DropCursorComponentProps = Omit<DropCursorExtensionComponentProps, 'options'> & {
  options: Required<DropCursorExtensionOptions>;
};

export const DropCursorComponent = ({ options, type, container }: DropCursorComponentProps) => {
  const { sx } = useRemirrorTheme();

  const { Component, ...rest } = options;

  return Component ? (
    <Component options={rest} type={type} container={container} />
  ) : type === 'block' ? (
    <div
      css={sx({
        width: numberToPixels(rest.blockWidth),
        backgroundColor: rest.color,
        height: numberToPixels(rest.blockHeight),
      })}
    />
  ) : (
    <span
      css={sx({
        display: 'inline',
        backgroundColor: rest.color,
        borderRadius: 0,
        margin: `0 ${numberToPixels(rest.inlineSpacing)}`,
        width: numberToPixels(rest.inlineWidth),
      })}
    >
      &nbsp;
    </span>
  );
};
