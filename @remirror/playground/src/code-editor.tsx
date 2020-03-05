import * as monaco from 'monaco-editor';
import React, { FC, useEffect, useMemo, useRef } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (newValue: string) => void;
}

const CodeEditor: FC<CodeEditorProps> = props => {
  const { value, onChange } = props;
  const ref = useRef<HTMLDivElement | null>(null);
  const model = useMemo(() => monaco.editor.createModel('', 'typescript'), []);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (ref.current) {
      editorRef.current = monaco.editor.create(ref.current, {
        model,
        language: 'typescript',
        automaticLayout: true,
      });
    }
  }, [model]);

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
