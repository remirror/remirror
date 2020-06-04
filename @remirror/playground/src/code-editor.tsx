import type { editor, Uri } from 'monaco-editor';
import React, { FC, useEffect, useRef, useState } from 'react';

import { addLibraryToRuntime } from './execute';
import { detectNewImportsToAcquireTypeFor } from './vendor/type-acquisition';

interface Monaco {
  editor: typeof editor;
  Uri: typeof Uri;
}

/**
 * This has been added so that it can work with gatsby during the build (ssr).
 *
 * See
 * https://medium.com/@michaellperry/gatsby-pages-with-client-only-script-85a7c5664a27#0457
 */
async function importMonaco(): Promise<Monaco> {
  const { editor, Uri } = await import('monaco-editor');

  return { editor, Uri };
}

interface CodeEditorProps {
  readOnly?: boolean;
  value: string;
  onChange: (newValue: string) => void;
}

const CodeEditor: FC<CodeEditorProps> = function (props) {
  const { value, onChange, readOnly } = props;
  const [monaco, setMonaco] = useState<Monaco>();
  const [model, setModel] = useState<editor.ITextModel>();

  const ref = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Set monaco
  useEffect(() => {
    importMonaco().then(setMonaco);
  }, []);

  useEffect(() => {
    if (!monaco) {
      return;
    }

    const model = monaco.editor.createModel(
      '',
      'typescript',
      monaco.Uri.parse('file:///usercode.tsx'),
    );

    setModel(model);
  }, [monaco]);

  useEffect(() => {
    if (!monaco) {
      return;
    }
    return () => {
      model?.dispose();
    };
  }, [model, monaco]);

  useEffect(() => {
    if (!monaco || !model) {
      return;
    }

    if (!ref.current) {
      return;
    }

    const myEditor = monaco.editor.create(ref.current, {
      model,
      language: 'typescript',
    });

    editorRef.current = myEditor;

    const getTypes = () => {
      const code = model.getValue();
      detectNewImportsToAcquireTypeFor(code, addLibraryToRuntime, window.fetch.bind(window));
    };

    myEditor.onDidChangeModelContent(getTypes);
    getTypes();

    return () => {
      myEditor.dispose();
    };
  }, [model, monaco]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        readOnly,
      });
    }
  }, [readOnly]);

  useEffect(() => {
    if (!monaco || !model) {
      return;
    }

    if (model.getValue() !== value) {
      model.setValue(value);
    }
  }, [model, value, monaco]);

  useEffect(() => {
    function layout() {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    }

    // Layout on each render
    layout();

    // Also layout whenever the window resizes
    window.addEventListener('resize', layout, false);

    return () => {
      window.removeEventListener('resize', layout, false);
    };
  });

  useEffect(() => {
    if (!model) {
      return;
    }

    model.onDidChangeContent((_event) => {
      onChange(model.getValue());
    });
  }, [model, onChange]);

  return <div style={{ flex: '1', overflow: 'hidden', backgroundColor: '#f3f' }} ref={ref} />;
};

export default CodeEditor;
