import styled from '@emotion/styled';
import React from 'react';
import { Shape } from '@remirror/core';

import { mainTheme } from '../debugger-constants';
import { JsonTree } from './json-tree';

interface JsonDiffProps {
  delta: any;
}

export const JsonDiff = (props: JsonDiffProps): JSX.Element | null => {
  if (!props.delta) {
    return null;
  }

  return (
    <JsonTree
      data={props.delta}
      hideRoot
      postprocessValue={postprocessValue}
      labelRenderer={labelRenderer}
      valueRenderer={valueRenderer}
      isCustomNode={Array.isArray}
      getItemString={getItemString}
      shouldExpandNode={() => true}
    />
  );
};

function postprocessValue(value: Shape) {
  if (value && value._t === 'a') {
    const res = {} as Shape;

    for (const key in value) {
      if (key !== '_t') {
        if (key[0] === '_' && !value[key.slice(1)]) {
          res[key.slice(1)] = value[key];
        } else if (value[`_${key}`]) {
          res[key] = [value[`_${key}`][0], value[key][0]];
        } else if (!value[`_${key}`] && key[0] !== '_') {
          res[key] = value[key];
        }
      }
    }

    return res;
  }

  return value;
}

function labelRenderer(raw: any[]) {
  return raw[0];
}

function stringifyAndShrink(val: unknown) {
  if (val === null) {
    return 'null';
  }

  const str = JSON.stringify(val);

  if (typeof str === 'undefined') {
    return 'undefined';
  }

  return str.length > 22 ? `${str.slice(0, 15)}…${str.slice(-5)}` : str;
}

function getValueString(raw: unknown) {
  if (typeof raw === 'string') {
    return raw;
  }

  return stringifyAndShrink(raw);
}

function replaceSpacesWithNonBreakingSpace(value: string) {
  return value.replace(/\s/gm, ' ');
}

function parseTextDiff(textDiff: string) {
  const diffByLines = textDiff.split(/\n/gm).slice(1);

  return diffByLines.map((line) => {
    const type = line.startsWith('-') ? 'delete' : line.startsWith('+') ? 'add' : 'raw';

    return { [type]: replaceSpacesWithNonBreakingSpace(line.slice(1)) };
  });
}

export function itemsCountString(count: number): string {
  return `${count}`;
}

export function getItemString(
  nodeType: string,
  _: unknown,
  itemType: React.ReactNode,
  itemString: string,
): JSX.Element {
  switch (nodeType) {
    case 'Object':
      return <span>{'{…}'}</span>;
    default:
      return (
        <span>
          {itemType} {itemString}
        </span>
      );
  }
}

function valueRenderer(raw: unknown) {
  if (Array.isArray(raw)) {
    if (raw.length === 1) {
      return <Added>{getValueString(raw[0])}</Added>;
    }

    if (raw.length === 2) {
      return (
        <Updated>
          <Deleted>{getValueString(raw[0])}</Deleted> =&gt; <Added>{getValueString(raw[1])}</Added>
        </Updated>
      );
    }

    if (raw.length === 3 && raw[1] === 0 && raw[2] === 0) {
      return <Deleted>{getValueString(raw[0])}</Deleted>;
    }

    if (raw.length === 3 && raw[2] === 2) {
      return (
        <Updated>
          &quot;
          {parseTextDiff(raw[0]).map((item) => {
            if (item.delete) {
              return <Deleted key={`${item.delete}delete`}>{item.delete}</Deleted>;
            }

            if (item.add) {
              return <Added key={`${item.add}add`}>{item.add}</Added>;
            }

            return <White key={`${item.raw}raw`}>{item.raw}</White>;
          })}
          &quot;
        </Updated>
      );
    }
  }

  return `${raw}`;
}

const Updated = styled.span`
  color: ${mainTheme.main};
`;

const White = styled.span`
  color: ${mainTheme.white};
`;

const Deleted = styled.span`
  display: inline-block;
  background: ${mainTheme.lightYellow};
  color: ${mainTheme.lightPink};
  padding: 1px 3px 2px;
  text-indent: 0;
  text-decoration: line-through;
  min-height: 1ex;
`;

const Added = styled.span`
  display: inline-block;
  background: ${mainTheme.lightYellow};
  color: ${mainTheme.darkGreen};
  padding: 1px 3px 2px;
  text-indent: 0;
  min-height: 1ex;
`;
