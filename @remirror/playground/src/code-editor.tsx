import { Uri, editor } from 'monaco-editor';
import React, { FC, useEffect, useMemo, useRef } from 'react';

interface CodeEditorProps {
  readOnly?: boolean;
  value: string;
  onChange: (newValue: string) => void;
}

const CodeEditor: FC<CodeEditorProps> = props => {
  const { value, onChange, readOnly } = props;
  const ref = useRef<HTMLDivElement | null>(null);
  const model = useMemo(() => editor.createModel('', 'typescript', Uri.parse('file:///usercode.tsx')), []);
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
      });
      editorRef.current = myEditor;
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
    if (editorRef.current) {
      editorRef.current.layout();
    }
  });

  useEffect(() => {
    model.onDidChangeContent(_event => {
      onChange(model.getValue());
    });
  }, [model, onChange]);

  return <div style={{ flex: '1', height: '100%', backgroundColor: '#f3f' }} ref={ref} />;
};

export default CodeEditor;
