import { editor, Uri } from 'monaco-editor';
import { FC, useEffect, useMemo, useRef } from 'react';

import { addLibraryToRuntime } from './execute';
import { detectNewImportsToAcquireTypeFor } from './vendor/type-acquisition';

interface CodeEditorProps {
  readOnly?: boolean;
  value: string;
  onChange: (newValue: string) => void;
}

const CodeEditor: FC<CodeEditorProps> = function (props) {
  const { value, onChange, readOnly } = props;
  const ref = useRef<HTMLDivElement | null>(null);
  const model = useMemo(
    () => editor.createModel('', 'typescript', Uri.parse('file:///usercode.tsx')),
    [],
  );
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    return () => {
      model.dispose();
    };
  }, [model]);

  useEffect(() => {
    if (ref.current) {
      const myEditor = editor.create(ref.current, {
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
    }

    return;
  }, [model]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        readOnly,
      });
    }
  }, [readOnly]);

  useEffect(() => {
    if (model.getValue() !== value) {
      model.setValue(value);
    }
  }, [model, value]);

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
    model.onDidChangeContent((_event) => {
      onChange(model.getValue());
    });
  }, [model, onChange]);

  return <div style={{ flex: '1', overflow: 'hidden', backgroundColor: 'white' }} ref={ref} />;
};

export default CodeEditor;
