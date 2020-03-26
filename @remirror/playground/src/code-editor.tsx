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
    return () => {
      console.log('DISPOSING OF MODEL');
      model.dispose();
    };
  }, [model]);

  useEffect(() => {
    if (ref.current) {
      const editor = monaco.editor.create(ref.current, {
        model,
      });
      editorRef.current = editor;
      return () => {
        console.log('DISPOSING OF EDITOR');
        editor.dispose();
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
