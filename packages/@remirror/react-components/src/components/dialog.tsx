import type { FC } from 'react';
import { useEffect } from 'react';
import { Dialog, DialogBackdrop, useDialogState } from 'reakit/Dialog';
import usePrevious from 'use-previous';

import { useTheme, UseThemeProps } from '../react-providers';

interface ControlledDialogProps {
  visible: boolean;
  onUpdate: (visible: boolean) => void;
  backdrop?: boolean;
}

/**
 * A controlled version of the Reakit `Dialog` component.
 */
export const ControlledDialog: FC<ControlledDialogProps> = (props) => {
  const { visible, children, backdrop = true, onUpdate } = props;
  const previousVisible = usePrevious(visible);
  const dialogState = useDialogState({ visible });
  const themeProps = useTheme({});

  useEffect(() => {
    if (visible !== previousVisible) {
      if (visible) {
        dialogState.show();
      } else {
        dialogState.hide();
      }

      return;
    }

    if (visible !== dialogState.visible) {
      onUpdate(dialogState.visible);
    }
  }, [onUpdate, previousVisible, visible, dialogState]);

  const dialog = (
    <Dialog {...dialogState} role='alertdialog' style={themeProps.style}>
      <Themed>{children}</Themed>
    </Dialog>
  );

  return backdrop ? <DialogBackdrop {...dialogState}>{dialog}</DialogBackdrop> : dialog;
};

const Themed: FC<UseThemeProps> = (props) => {
  const { children, ...themeProps } = props;
  const { style, className } = useTheme(themeProps);

  return (
    <div style={style} className={className}>
      {props.children}
    </div>
  );
};
