import * as monaco from 'monaco-editor';
import React, { FC, useEffect, useMemo, useRef } from 'react';

interface CodeEditorProps {
  readOnly?: boolean;
  value: string;
  onChange: (newValue: string) => void;
}

const CodeEditor: FC<CodeEditorProps> = props => {
  const { value, onChange, readOnly } = props;
  const ref = useRef<HTMLDivElement | null>(null);
  const model = useMemo(
    () => monaco.editor.createModel('', 'typescript', monaco.Uri.parse('file:///remirror.tsx')),
    [],
  );
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    return () => model.dispose();
  }, [model]);

  useEffect(() => {
    if (ref.current) {
      editorRef.current = monaco.editor.create(ref.current, {
        model,
        automaticLayout: true,
      });
    }
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
    model.onDidChangeContent(_event => {
      onChange(model.getValue());
    });
  }, [model, onChange]);

  return <div style={{ flex: '1', height: '100%', backgroundColor: '#f3f' }} ref={ref} />;
};

export default CodeEditor;
