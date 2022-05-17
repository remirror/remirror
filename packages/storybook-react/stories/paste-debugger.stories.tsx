import { css } from '@emotion/css';
import prettyPrint from 'diffable-html';
import { escape } from 'html-escaper';
import React, { useCallback, useEffect, useState } from 'react';
import markup from 'refractor/lang/markup';
import { CodeBlockExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const extensions = () => [
  new CodeBlockExtension({
    supportedLanguages: [markup],
  }),
];

const classNames = [
  css`
    max-width: calc(100vw - 2rem);
  `,
];

const Editor: React.FC<{ language: string; data: string }> = ({ language, data }) => {
  const content = `<pre><code data-code-block-language="${language}">${data}</code></pre>`;
  const { manager, state, onChange, setState } = useRemirror({
    extensions,
    content,
    stringHandler: 'html',
  });

  useEffect(() => {
    setState(manager.createState({ content }));
  }, [manager, setState, content]);

  return (
    <Remirror
      manager={manager}
      state={state}
      onChange={onChange}
      autoRender
      editable={false}
      classNames={classNames}
    />
  );
};

export const PasteDebugger: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>();
  const [textContent, setTextContent] = useState<string>();

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const { clipboardData } = e;
    const html = clipboardData?.getData('text/html') ?? '';
    setHtmlContent(escape(prettyPrint(html)).trim());
    setTextContent(clipboardData?.getData('text/plain') ?? '');
  }, []);

  useEffect(() => {
    window.document.addEventListener('paste', handlePaste);

    return () => {
      window.document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  return (
    <ThemeProvider>
      <h2>Perform a paste to view the contents of the clipboard</h2>
      {htmlContent && (
        <>
          <h3>HTML Content</h3>
          <Editor language='markup' data={htmlContent} />
        </>
      )}
      {textContent && (
        <>
          <h3>Plain Text Content</h3>
          <Editor language='text' data={textContent} />
        </>
      )}
    </ThemeProvider>
  );
};

export default {
  component: PasteDebugger,
  title: 'Utils / Paste Debugger',
  parameters: {
    layout: 'centered',
  },
};
