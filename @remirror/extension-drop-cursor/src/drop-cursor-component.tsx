import { useRemirrorTheme } from '@remirror/ui';
import { DropCursorExtensionOptions } from './drop-cursor-types';

export const DropCursorComponent = ({ options }: { options: DropCursorExtensionOptions }) => {
  const { sx } = useRemirrorTheme();

  const { Component, color = 'primary', width = '100%', ...rest } = options;

  return Component ? (
    <Component color={color} width={width} {...rest} />
  ) : (
    <div
      {...rest}
      css={sx({
        color,
        borderRadius: 0,
        margin: '2px 0',
        width,
        height: '2px',
      })}
    />
  );
};
