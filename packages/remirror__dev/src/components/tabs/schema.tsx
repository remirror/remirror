import React from 'react';
import { Subscribe } from 'unstated';

import { useDevStore } from '../../dev-state';
import JSONTree from '../components/json-tree.tsv';
import { SplitView, SplitViewColumn } from '../components/split-view';
import EditorStateContainer from '../state/editor';
import { Heading } from './../components/heading';

const ignoreFields = ['schema', 'contentExpr', 'schema', 'parseDOM', 'toDOM'];

export function postprocessValue(ignore, data) {
  if (!data || Object.prototype.toString.call(data) !== '[object Object]') {
    return data;
  }

  return Object.keys(data)
    .filter((key) => !ignore.includes(key))
    .reduce((res, key) => {
      res[key] = data[key];
      return res;
    }, {});
}

export const SchemaTab = (): JSX.Element => {
  const schema = useDevStore((store) => store.state.schema);

  return (
    <SplitView>
      <SplitViewColumn grow>
        <Heading>Nodes</Heading>
        <JSONTree
          data={schema.nodes}
          postprocessValue={postprocessValue.bind(null, ignoreFields)}
        />
      </SplitViewColumn>
      <SplitViewColumn grow sep>
        <Heading>Marks</Heading>
        <JSONTree
          data={schema.marks}
          postprocessValue={postprocessValue.bind(null, ignoreFields)}
        />
      </SplitViewColumn>
    </SplitView>
  );
};
