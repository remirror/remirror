/**
 * @packageDocumentation
 *
 * This file contains the code editor which is used to render the playground
 * code when in advanced mode. It has quite a large footprint, requiring the
 * loading of multiple dts files.
 *
 * This code editor will be loaded asynchronously due to it's size. It will
 * provide the editor.
 *
 */

import styled from '@emotion/styled';
import type { editor } from 'monaco-editor';
import { FC, useEffect, useLayoutEffect, useRef } from 'react';
import usePrevious from 'use-previous';

import { codeEditorHelper, ConfigurationSelector, useConfiguration } from '../playground-state';

/**
 * This editor is a shallow wrapper around the monaco editor. It should be
 * loaded only when required as it requires a lot.
 *
 * It should only be added to the dom after everything has been loaded.
 */
export const CodeEditor: FC = () => {
  const contextProps = useConfiguration(ConfigurationSelector.props);
  const actions = useConfiguration(ConfigurationSelector.actions);
  const { files, readOnly } = useConfiguration(ConfigurationSelector.props);
  const { content, path } = useConfiguration(ConfigurationSelector.activeFile);
  const previousFiles = usePrevious(files);

  const contextPropsRef = useRef(contextProps);
  contextPropsRef.current = contextProps;

  const activeFileRef = useRef({ content, path });
  activeFileRef.current = { path, content };

  // This is the container div for the code editor.
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Handles the local instance of the editor.
  const editorRef = useRef<editor.IStandaloneCodeEditor>();

  // Attach the editor to the dom once the container is mounted.
  useLayoutEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const { path, content } = activeFileRef.current;

    // Attach the monaco editor to the dom and save the reference to the editor.
    const editor = codeEditorHelper.createEditorAndAttach(containerRef.current);

    // Fetch the initial typings
    codeEditorHelper.fetchTypingsFromCode(path, content);

    // Track the ref.
    editorRef.current = editor;

    return editor.dispose;
  }, []);

  useEffect(() => {
    return codeEditorHelper.createCompletionProvider(() => contextPropsRef.current);
  }, []);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    // Cached value of the editor.
    const editor = editorRef.current;

    // Create a subscription for editor updates.
    return editor.onDidChangeModelContent(() => {
      const { path, content } = activeFileRef.current;
      const model = editor.getModel();

      if (!model) {
        return;
      }

      const value = model.getValue();

      if (value !== content) {
        codeEditorHelper.fetchTypingsFromCode(path, content);
        // Update the content at the provided path
        actions.updateFileContent(path, value);
      }
    }).dispose;
  }, [actions]);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    // Cached value of the editor.
    const editor = editorRef.current;

    // Get the content for the active file (this is placed here rather than in
    // the outer scope so that it doesn't cause an update of this `useEffect`
    // hook).
    const { content } = activeFileRef.current;

    // Open the file at the changed active path.
    codeEditorHelper.setActiveModel(editor, path, content, true);
  }, [path]);

  // Update the readonly status of the editor.
  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    editorRef.current.updateOptions({ readOnly });
  }, [readOnly]);

  // Update the monaco editor value when the value state is updated. The state
  // can be updated by prettier or toggling between configuration and advanced
  // mode.
  useEffect(() => {
    for (const file of files) {
      if (file.type !== 'text' || file.path === path) {
        continue;
      }

      const previousFile = previousFiles?.find((previous) => previous.path === file.path);

      if (previousFile && previousFile.content === file.content) {
        continue;
      }

      codeEditorHelper.updateModelForPath(file.path, file.content);
    }
  }, [files, previousFiles, path]);

  // Update the layout of the editor in response to the window size changing.
  useEffect(() => {
    return codeEditorHelper.handleLayout(editorRef.current);
  }, []);

  return <StyledContainer ref={containerRef} />;
};

/**
 * The styled container which will be used to hold onto the editor.
 */
const StyledContainer = styled.div`
  flex: 1;
  overflow: hidden;
  background-color: red;
  height: 100vh;
  width: 100%;
`;
