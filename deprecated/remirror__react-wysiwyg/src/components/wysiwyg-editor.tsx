import { styled } from 'linaria/react';
import React, { FC } from 'react';

import { useWysiwygRemirror } from '../hooks';
import type { WysiwygProviderProps } from '../wysiwyg-types';
import { WysiwygProvider } from './wysiwyg-provider';

export interface WysiwygEditorProps extends Partial<WysiwygProviderProps> {}

/**
 * A prebuilt `WysiwygEditor` which combines the building blocks for you to
 * create an editor with minimal lines of code.
 */
export const WysiwygEditor: FC<WysiwygEditorProps> = (props: WysiwygEditorProps) => {
  const { children, ...providerProps } = props;

  return (
    <WysiwygProvider {...providerProps}>
      <WysiwygEditorContainerComponent data-testid='remirror-editor'>
        <TextEditor />
        {children}
      </WysiwygEditorContainerComponent>
    </WysiwygProvider>
  );
};

/**
 * The editing functionality within the Wysiwyg Editor context.
 */
const TextEditor = () => {
  const { getRootProps } = useWysiwygRemirror();

  return <WysiwygEditorComponent className={'shadow-center-2'} {...getRootProps()} />;
};

/**
 * The component into which the prosemirror editor will be injected into.
 */
export const WysiwygEditorComponent = styled.div`
  .ProseMirror {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    box-sizing: border-box;
    position: relative;
    border-width: 1px;
    border-style: solid;
    border-color: black;
    box-shadow: 0 0 0 1px black;
    line-height: 1.625rem;
    border-radius: 8px;
    width: 100%;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 16px;
    max-height: calc(90vh - 124px);
    min-height: 142px;
    padding: 8px;
    padding-right: 40px;

    p {
      margin: 0px;
      letter-spacing: 0.6px;
      color: text;
    }

    a.mention {
      pointer-events: none;
      cursor: default;
    }

    a {
      text-decoration: none !important;
      color: blue;
    }

    &:focus {
      outline: none;
      box-shadow: focus;
    }

    .Prosemirror-selectednode {
      background-color: grey;
    }
  }
`;

export const WysiwygEditorContainerComponent = styled.div`
  position: relative;
  height: 100%;
`;
