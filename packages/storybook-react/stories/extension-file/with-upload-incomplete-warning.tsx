import 'remirror/styles/extension-file.css';

import { css } from '@emotion/css';
import { useCallback, useState } from 'react';
import { DropCursorExtension } from 'remirror/extensions';
import { hasUploadingFile } from '@remirror/core';
import { createSlowFileUploader, FileExtension } from '@remirror/extension-file';
import {
  Button,
  ControlledDialogComponent,
  Remirror,
  ThemeProvider,
  useHelpers,
  useRemirror,
  useRemirrorContext,
} from '@remirror/react';

const WithUploadIncompleteWarning = (): JSX.Element => {
  const extensions = useCallback(
    () => [
      new FileExtension({ uploadFileHandler: createSlowFileUploader }),
      new DropCursorExtension(),
    ],
    [],
  );
  const { manager, state } = useRemirror({ extensions, content, stringHandler: 'html' });

  return (
    <>
      <p>
        Click the save button below <strong>while a file is uploading</strong>. You will see a
        warning dialog.
      </p>
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state} autoRender='end'>
          <SaveButton />
        </Remirror>
      </ThemeProvider>
    </>
  );
};

const content = `<p>Drag and drop one or multiple non-image files into the editor.</p>`;

const SaveButton: React.FC = () => {
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [showSaved, setShowSaved] = useState<boolean>(false);
  const { getState } = useRemirrorContext();
  const { getJSON } = useHelpers();

  const onSave = useCallback(
    (forceSave = false) => {
      const state = getState();

      if (!forceSave) {
        const isUploading = hasUploadingFile(state);

        if (isUploading) {
          setShowWarning(true);
          return;
        }
      }

      console.log('JSON state', getJSON(state));
      setShowSaved(true);
    },
    [getState, getJSON],
  );

  return (
    <>
      <Button onClick={() => onSave()}>Save</Button>
      <ControlledDialogComponent
        visible={showWarning}
        onUpdate={(v) => setShowWarning(v)}
        backdrop={false}
      >
        <p>Warning, you have incomplete file uploads</p>
        <div
          className={css`
            display: flex;
            justify-content: space-between;
          `}
        >
          <Button onClick={() => setShowWarning(false)}>Cancel</Button>
          <Button onClick={() => onSave(true)}>Save anyway</Button>
        </div>
      </ControlledDialogComponent>
      <ControlledDialogComponent
        visible={showSaved}
        onUpdate={(v) => setShowSaved(v)}
        backdrop={false}
      >
        <p>Content saved. (See console)</p>
        <div
          className={css`
            display: flex;
            justify-content: center;
          `}
        >
          <Button onClick={() => setShowSaved(false)}>Ok</Button>
        </div>
      </ControlledDialogComponent>
    </>
  );
};

export default WithUploadIncompleteWarning;
