import React, { ComponentType, FC } from 'react';

import { isString, ObjectMark, ObjectNode } from '@remirror/core';

/* Inspired by https://github.com/rexxars/react-prosemirror-document */

type MarkMap = Partial<Record<string, string | ComponentType<any>>>;
interface TextHandlerProps {
  node: ObjectNode;
  markMap: MarkMap;
  skipUnknownMarks?: boolean;
}

const TextHandler: FC<TextHandlerProps> = ({ node, ...props }) => {
  if (!node.text) {
    return null;
  }

  const textElement = <>{node.text}</>;

  if (!node.marks) {
    return textElement;
  }

  const fn = (child: JSX.Element, mark: ObjectMark | string) => {
    const normalized = normalizeMark(mark);
    const MarkHandler = props.markMap[normalized.type];

    if (!MarkHandler) {
      if (!props.skipUnknownMarks) {
        throw new Error('No handler for mark type `' + normalized.type + '` registered');
      }

      return child;
    }

    return <MarkHandler {...normalized.attrs}>{child}</MarkHandler>;
  };

  // Use assigned mark handlers
  return node.marks.reduce<JSX.Element>(fn, textElement);
};

const normalizeMark = (mark: ObjectMark | string) =>
  isString(mark) ? { type: mark, attrs: {} } : { attrs: {}, ...mark };

const CodeBlock: FC<{
  node: ObjectNode;
  markMap: MarkMap;
}> = props => {
  const content = props.node.content;
  if (!content) {
    return null;
  }

  content.map((node, ii) => {
    return <TextHandler key={ii} {...{ ...props, node }} />;
  });

  return (
    <pre>
      <code>{content}</code>
    </pre>
  );
};

const Doc: FC<SubRenderTreeProps> = ({ node, ...props }) => {
  const content = node.content;
  if (!content || !content.length) {
    return null;
  }

  const children = content.map((child, ii) => {
    return <RenderTree json={child} {...props} key={ii} />;
  });

  return <div {...(node.attrs || {})}>{children}</div>;
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
  node: ObjectNode;
}

export interface RenderTreeProps extends Partial<BaseRenderTreeProps> {
  json: ObjectNode;
}

export const RenderTree: FC<RenderTreeProps> = ({
  json,
  markMap = defaultMarkMap,
  skipUnknownMarks = false,
  skipUnknownTypes = false,
  typeMap = defaultTypeMap,
}) => {
  if (json.type === 'text' && json.text && (!json.marks || !json.marks.length)) {
    return <>{json.text}</>; // For some reason FunctionalComponent don't allow returning react-nodes
  }

  const rest = { markMap, typeMap, skipUnknownMarks, skipUnknownTypes };

  const TypeHandler = typeMap[json.type];
  if (!TypeHandler) {
    if (!skipUnknownTypes) {
      throw new Error('No handler for node type `' + json.type + '` registered');
    }
    return null;
  }

  const props = isString(TypeHandler) ? json.attrs || {} : { ...rest, node: json };
  const { content } = json;
  if (!content || !content.length) {
    return <TypeHandler {...props} />;
  }

  const children = content.map((child, ii) => {
    return <RenderTree key={ii} json={child} {...rest} />;
  });

  return <TypeHandler {...props}>{children}</TypeHandler>;
};
