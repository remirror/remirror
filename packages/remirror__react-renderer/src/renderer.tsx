import { FC, Fragment } from 'react';
import { isEmptyArray, isString, object, RemirrorJSON } from '@remirror/core';

import { CodeBlock, TextHandler } from './handlers';
import { MarkMap } from './types';

export const Doc: FC<SubRenderTreeProps> = ({ node, ...props }) => {
  const content = node.content;

  if (!content || isEmptyArray(content)) {
    return null;
  }

  const children = content.map((child, ii) => {
    return <RemirrorRenderer json={child} {...props} key={ii} />;
  });

  return <div {...(node.attrs ?? object())}>{children}</div>;
};

const defaultTypeMap: MarkMap = {
  doc: Doc,
  paragraph: 'p',
  image: 'img',
  hardBreak: 'br',
  codeBlock: CodeBlock,
  text: TextHandler,
};

const defaultMarkMap: MarkMap = {
  italic: 'em',
  bold: 'strong',
  code: 'code',
  link: 'a',
  underline: 'u',
};

export interface BaseRenderTreeProps {
  skipUnknownTypes: boolean;
  skipUnknownMarks: boolean;
  markMap: MarkMap;
  typeMap: MarkMap;
  children?: never;
}

export interface SubRenderTreeProps extends BaseRenderTreeProps {
  node: RemirrorJSON;
}

export interface RenderTreeProps extends Partial<BaseRenderTreeProps> {
  json: RemirrorJSON;
}

/**
 * A recursively rendered tree.
 */
export const RemirrorRenderer: FC<RenderTreeProps> = (props) => {
  const {
    json,
    markMap = defaultMarkMap,
    skipUnknownMarks = false,
    skipUnknownTypes = false,
    typeMap = defaultTypeMap,
  } = props;

  if (json.type === 'text' && json.text && (!json.marks || isEmptyArray(json.marks))) {
    return <Fragment>{json.text}</Fragment>; // For some reason FunctionalComponent don't allow returning react-nodes
  }

  const rest = { markMap, typeMap, skipUnknownMarks, skipUnknownTypes };
  const TypeHandler = typeMap[json.type];

  if (!TypeHandler) {
    if (!skipUnknownTypes) {
      throw new Error(`No handler for node type \`${json.type}\` registered`);
    }

    return null;
  }

  const childProps = isString(TypeHandler) ? json.attrs ?? object() : { ...rest, node: json };
  const { content } = json;

  if (!content || isEmptyArray(content)) {
    return <TypeHandler {...childProps} />;
  }

  const children = content.map((child, ii) => {
    return <RemirrorRenderer key={ii} json={child} {...rest} />;
  });

  return <TypeHandler {...childProps}>{children}</TypeHandler>;
};
