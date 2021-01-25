import { isObject, Shape } from '@remirror/core';

import { useDebuggerStore } from '../../debugger-state';
import { JsonTree } from '../json-tree';
import { Heading, SplitView, SplitViewColumn } from '../styled';

const ignoreFields = ['schema', 'contentExpr', 'schema', 'parseDOM', 'toDOM'];

function postprocessValue(ignore: string[], data: unknown) {
  if (!data || !isObject(data)) {
    return data;
  }

  const processedValue: Shape = {};

  for (const [key, value] of Object.entries(data)) {
    if (ignore.includes(key)) {
      continue;
    }

    processedValue[key] = value;
  }

  return processedValue;
}

export const SchemaTab = (): JSX.Element => {
  const schema = useDebuggerStore((store) => store.state.schema);

  return (
    <SplitView>
      <SplitViewColumn grow>
        <Heading>Nodes</Heading>
        <JsonTree
          data={schema.nodes}
          postprocessValue={postprocessValue.bind(null, ignoreFields)}
        />
      </SplitViewColumn>
      <SplitViewColumn grow sep>
        <Heading>Marks</Heading>
        <JsonTree
          data={schema.marks}
          postprocessValue={postprocessValue.bind(null, ignoreFields)}
        />
      </SplitViewColumn>
    </SplitView>
  );
};
