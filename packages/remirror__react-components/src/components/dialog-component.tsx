import { FC, useEffect } from 'react';
import { Dialog, DialogBackdrop, useDialogState } from 'reakit/Dialog';
import usePrevious from 'use-previous';

import { useTheme, UseThemeProps } from '../providers';

interface ControlledDialogProps {
  visible: boolean;
  onUpdate: (visible: boolean) => void;
  backdrop?: boolean;
}

/**
 * A controlled version of the Reakit `Dialog` component.
 */
export const ControlledDialogComponent: FC<ControlledDialogProps> = (props) => {
  const { visible, children, backdrop = false, onUpdate } = props;
  const previousVisible = usePrevious(visible);
  const dialogState = useDialogState({ visible, modal: false });
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
    // <Portal>
    <Dialog
      {...dialogState}
      role='alertdialog'
      tabIndex={0}
      style={themeProps.style}
      unstable_autoFocusOnHide={false}
      unstable_autoFocusOnShow={false}
      // unstable_={false}
    >
      <Themed>{children}</Themed>
    </Dialog>
    // </Portal>
  );

  return backdrop ? <DialogBackdrop {...dialogState}>{dialog}</DialogBackdrop> : dialog;
};

const Themed: FC<UseThemeProps> = (props) => {
  const { children, ...themeProps } = props;
  const { style, className } = useTheme(themeProps);

  return (
    <div style={style} className={className}>
      {children}
    </div>
  );
};
