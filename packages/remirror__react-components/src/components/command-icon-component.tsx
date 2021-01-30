import { Box } from 'reakit/Box';
import { CommandUiIcon, isString } from '@remirror/core';
import { CoreIcon } from '@remirror/icons';

import { Icon } from '../icons';

interface CommandIconProps {
  icon: CoreIcon | CommandUiIcon;
  wrapperClass?: string;
}

export const CommandIconComponent = (props: CommandIconProps): JSX.Element => {
  const { icon, wrapperClass } = props;

  if (isString(icon)) {
    return <Icon name={icon} />;
  }

  // Render when the icon is a complex icon.
  return (
    <Box as='span' className={wrapperClass}>
      {icon.sup && icon.sup}
      <Icon name={icon.name} />
      {icon.sub && icon.sub}
    </Box>
  );
};
