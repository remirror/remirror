import 'remirror/styles/all.css';

import React, { useCallback } from 'react';
import { htmlToProsemirrorNode } from 'remirror';
import { CalloutExtension } from 'remirror/extensions';
import { i18nFormat } from '@remirror/i18n';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { CalloutTypeButtonGroup, Toolbar } from '@remirror/react-ui';

const Basic = (): JSX.Element => {
  const basicExtensions = useCallback(() => [new CalloutExtension()], []);
  const { manager, state, onChange } = useRemirror({
    extensions: basicExtensions,
    content:
      '<div data-callout-type="info"><p>Info callout</p></div><p />' +
      '<div data-callout-type="warning"><p>Warning callout</p></div><p />' +
      '<div data-callout-type="error"><p>Error callout</p></div><p />' +
      '<div data-callout-type="success"><p>Success callout</p></div>',
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror
        manager={manager}
        autoFocus
        onChange={onChange}
        initialContent={state}
        autoRender='end'
        i18nFormat={i18nFormat}
      >
        <Toolbar>
          <CalloutTypeButtonGroup />
        </Toolbar>
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
