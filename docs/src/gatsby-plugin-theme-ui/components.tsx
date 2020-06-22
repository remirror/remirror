/** @jsx jsx */

import 'remirror/core';

import { css } from '@emotion/core';
import CodeBlock from '@theme-ui/prism';
import { ElementType, FC, Fragment } from 'react';
import { jsx } from 'theme-ui';

import { capitalize, isString } from 'remirror/core/helpers';

const heading = (Tag: ElementType) => {
  const Component: FC<{ id: string }> = (props) =>
    props.id ? (
      <Tag {...props}>
        <a
          href={`#${props.id}`}
          sx={{
            color: 'inherit',
            textDecoration: 'none',
            ':hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {props.children}
        </a>
      </Tag>
    ) : (
      <Tag {...props} />
    );
  Component.displayName = isString(Tag) ? capitalize(Tag) : 'Heading';

  return Component;
};

const Pre: FC = ({ children }) => <Fragment>{children}</Fragment>;

const Code: FC = (props) => (
  <code
    css={css`
      code[class*='language-'],
      pre[class*='language-'] {
        text-align: left;
        white-space: pre;
        word-spacing: normal;
        word-break: normal;
        word-wrap: normal;
        color: #eee;
        background: #2f2f2f;
        border-radius: 4px;
        max-height: 500px;
        font-family: Menlo, monospace;
        font-size: 1em;
        line-height: 1.5em;

        -moz-tab-size: 4;
        -o-tab-size: 4;
        tab-size: 4;

        -webkit-hyphens: none;
        -moz-hyphens: none;
        -ms-hyphens: none;
        hyphens: none;
      }

      code[class*='language-']::-moz-selection,
      pre[class*='language-']::-moz-selection,
      code[class*='language-'] ::-moz-selection,
      pre[class*='language-'] ::-moz-selection {
        background: #363636;
      }

      code[class*='language-']::selection,
      pre[class*='language-']::selection,
      code[class*='language-'] ::selection,
      pre[class*='language-'] ::selection {
        background: #363636;
      }

      :not(pre) > code[class*='language-'] {
        white-space: normal;
        border-radius: 0.2em;
        padding: 0.1em;
      }

      pre[class*='language-'] {
        overflow: auto;
        position: relative;
        margin: 0.5em 0;
        padding: 1.25em 1em;
      }

      .language-css > code,
      .language-sass > code,
      .language-scss > code {
        color: #fd9170;
      }

      [class*='language-'] .namespace {
        opacity: 0.7;
      }

      .token.atrule {
        color: #c792ea;
      }

      .token.attr-name {
        color: #ffcb6b;
      }

      .token.attr-value {
        color: #a5e844;
      }

      .token.attribute {
        color: #a5e844;
      }

      .token.boolean {
        color: #c792ea;
      }

      .token.builtin {
        color: #ffcb6b;
      }

      .token.cdata {
        color: #80cbc4;
      }

      .token.char {
        color: #80cbc4;
      }

      .token.class {
        color: #ffcb6b;
      }

      .token.class-name {
        color: #f2ff00;
      }

      .token.comment {
        color: #616161;
      }

      .token.constant {
        color: #c792ea;
      }

      .token.deleted {
        color: #ff6666;
      }

      .token.doctype {
        color: #616161;
      }

      .token.entity {
        color: #ff6666;
      }

      .token.function {
        color: #c792ea;
      }

      .token.hexcode {
        color: #f2ff00;
      }

      .token.id {
        color: #c792ea;
        font-weight: bold;
      }

      .token.important {
        color: #c792ea;
        font-weight: bold;
      }

      .token.inserted {
        color: #80cbc4;
      }

      .token.keyword {
        color: #c792ea;
      }

      .token.number {
        color: #fd9170;
      }

      .token.operator {
        color: #89ddff;
      }

      .token.prolog {
        color: #616161;
      }

      .token.property {
        color: #80cbc4;
      }

      .token.pseudo-class {
        color: #a5e844;
      }

      .token.pseudo-element {
        color: #a5e844;
      }

      .token.punctuation {
        color: #89ddff;
      }

      .token.regex {
        color: #f2ff00;
      }

      .token.selector {
        color: #ff6666;
      }

      .token.string {
        color: #a5e844;
      }

      .token.symbol {
        color: #c792ea;
      }

      .token.tag {
        color: #ff6666;
      }

      .token.unit {
        color: #fd9170;
      }

      .token.url {
        color: #ff6666;
      }

      .token.variable {
        color: #ff6666;
      }
    `}
  >
    <CodeBlock {...props} />
  </code>
);

export default {
  code: Code,
  pre: Pre,
  h2: heading('h2'),
  h3: heading('h3'),
  h4: heading('h4'),
  h5: heading('h5'),
  h6: heading('h6'),
};
