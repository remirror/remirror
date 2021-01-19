import { ComponentType, FC, Fragment } from 'react';

import { isEmptyArray, isString, object, ObjectMark, RemirrorJSON } from '@remirror/core';

type MarkMap = Partial<Record<string, string | ComponentType<any>>>;
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

const CodeBlock: FC<{
  node: RemirrorJSON;
  markMap: MarkMap;
}> = (props) => {
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

  if (!content || isEmptyArray(content)) {
    return null;
  }

  const children = content.map((child, ii) => {
    return <RenderTree json={child} {...props} key={ii} />;
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
export const RenderTree: FC<RenderTreeProps> = (props) => {
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
    return <RenderTree key={ii} json={child} {...rest} />;
  });

  return <TypeHandler {...childProps}>{children}</TypeHandler>;
};
