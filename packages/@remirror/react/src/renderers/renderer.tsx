import { ComponentType, FC, Fragment, ReactNode } from 'react';

import { isEmptyArray, isString, object, ObjectMark, RemirrorJSON } from '@remirror/core';

/* Inspired by https://github.com/rexxars/react-prosemirror-document */

type MarkMap = Partial<Record<string, string | ComponentType<SubRenderTreeProps>>>;
interface TextHandlerProps {
  node: RemirrorJSON;
  markMap: MarkMap;
  skipUnknownMarks?: boolean;
}

const normalizeMark = (mark: ObjectMark | string) =>
  isString(mark) ? { type: mark, attrs: {} } : { attrs: {}, ...mark };

const TextHandler: FC<TextHandlerProps> = ({ node, ...props }) => {
  if (!node.text) {
    return null;
  }

  let textElement = <Fragment>{node.text}</Fragment>;

  if (!node.marks) {
    return textElement;
  }

  for (const mark of node.marks) {
    const normalized = normalizeMark(mark);
    const MarkHandler = props.markMap[normalized.type];

    if (!MarkHandler) {
      if (!props.skipUnknownMarks) {
        throw new Error(`No handler for mark type \`${normalized.type}\` registered`);
      }

      continue;
    }

    textElement = <MarkHandler {...normalized.attrs}>{textElement}</MarkHandler>;
  }

  return textElement;
};

const Heading: FC<{
  node: RemirrorJSON;
  markMap: MarkMap;
}> = (props) => {
  const content = props.node.content;

  if (!content) {
    return null;
  }

  const children = content.map((node, ii) => {
    return <TextHandler key={ii} {...props} node={node} />;
  });

  switch (props.node.attrs?.level) {
    case 1:
      return <h1>{children}</h1>;
    case 2:
      return <h2>{children}</h2>;
    case 3:
      return <h3>{children}</h3>;
    case 4:
      return <h4>{children}</h4>;
    case 5:
      return <h5>{children}</h5>;
    case 6:
      return <h6>{children}</h6>;
    default:
      return <h3>{children}</h3>;
  }
};

const CodeBlock: FC<{
  node: RemirrorJSON;
  markMap: MarkMap;
}> = (props) => {
  const content = props.node.content;

  if (!content) {
    return null;
  }

  return (
    <pre>
      <code>{content}</code>
    </pre>
  );
};

const Doc: FC<SubRenderTreeProps> = ({ node, ...props }) => {
  const content = node.content;

  if (!content || isEmptyArray(content)) {
    return null;
  }

  const children = content.map((child, ii) => {
    return <RenderTree node={child} {...props} key={ii} />;
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
  heading: Heading,
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
  children?: ReactNode;
}

export interface SubRenderTreeProps extends BaseRenderTreeProps {
  node: RemirrorJSON;
}

export interface RenderTreeProps extends Partial<BaseRenderTreeProps> {
  node: RemirrorJSON;
}

/**
 * A recursively rendered tree.
 */
export const RenderTree: FC<RenderTreeProps> = (props) => {
  const {
    node,
    markMap = defaultMarkMap,
    skipUnknownMarks = false,
    skipUnknownTypes = false,
    typeMap = defaultTypeMap,
  } = props;

  if (node.type === 'text' && node.text && (!node.marks || isEmptyArray(node.marks))) {
    return <>{node.text}</>;
  }

  const rest = {
    markMap: { ...defaultMarkMap, markMap },
    typeMap: { ...defaultTypeMap, typeMap },
    skipUnknownMarks,
    skipUnknownTypes,
  };
  const TypeHandler = typeMap[node.type];

  if (!TypeHandler) {
    if (!skipUnknownTypes) {
      throw new Error(`No handler for node type \`${node.type}\` registered`);
    }

    return null;
  }

  const childProps = isString(TypeHandler) ? node.attrs ?? object() : { ...rest, node };
  const { content } = node;

  if (!content || isEmptyArray(content)) {
    return isString(TypeHandler) ? (
      <TypeHandler {...node.attrs} />
    ) : (
      <TypeHandler {...rest} node={node} />
    );
  }

  const children = content.map((child, ii) => {
    return <RenderTree key={ii} node={child} {...rest} />;
  });

  return <TypeHandler {...childProps}>{children}</TypeHandler>;
};
