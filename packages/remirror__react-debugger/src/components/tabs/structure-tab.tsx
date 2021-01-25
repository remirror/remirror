import styled from '@emotion/styled';
import { assertGet, Fragment, NodeWithPosition, ProsemirrorNode } from '@remirror/core';

import { mainTheme } from '../../debugger-constants';
import { useDebuggerStore } from '../../debugger-state';
import { JsonTree } from '../json-tree';
import { Heading, HeadingButton, HeadingWithButton, SplitView, SplitViewColumn } from '../styled';

interface BlockNodeContentProps extends BaseNodeProps {
  colors: Record<string, string>;
  content: Fragment;
}

const BlockNodeContent = (props: BlockNodeContentProps) => {
  if (!props.content || props.content.size === 0 || !props.content.firstChild) {
    return null;
  }

  const content = props.content.firstChild;

  if (content.isBlock) {
    const childNodes: JSX.Element[] = [];
    let startPos = props.startPos + 1;

    content.forEach((childNode, index) => {
      const pos = startPos;
      startPos += childNode.nodeSize;
      childNodes.push(
        <BlockNode
          key={index}
          node={childNode}
          colors={props.colors}
          onNodeSelected={props.onNodeSelected}
          startPos={pos}
        />,
      );
    });

    return <BlockNodeContentView>{childNodes}</BlockNodeContentView>;
  }

  const childNodes: JSX.Element[] = [];
  let startPos = props.startPos;
  content.forEach((childNode, index) => {
    const pos = startPos;
    startPos += childNode.nodeSize;
    childNodes.push(
      <InlineNode
        key={index}
        index={index}
        node={childNode}
        background={assertGet(props.colors, childNode.type.name)}
        onNodeSelected={props.onNodeSelected}
        startPos={pos}
      />,
    );
  });

  return <BlockNodeContentViewWithInline>{}</BlockNodeContentViewWithInline>;
};

interface BaseNodeProps {
  startPos: number;
  onNodeSelected: (nodeWithPosition: NodeWithPosition | undefined) => void;
}

interface BlockNodeProps extends BaseNodeProps {
  colors: Record<string, string>;
  node: ProsemirrorNode;
}

const BlockNode = (props: BlockNodeProps) => {
  const { colors, node, startPos, onNodeSelected } = props;
  const color = assertGet(colors, node.type.name);
  return (
    <BlockNodeWrapper>
      <BlockNodeView background={color} onClick={() => onNodeSelected({ node, pos: startPos })}>
        <Side>{startPos}</Side>
        <Center>{node.type.name}</Center>
        <Side>{startPos + node.nodeSize - 1}</Side>
      </BlockNodeView>
      <BlockNodeContent
        content={node.content}
        colors={colors}
        onNodeSelected={onNodeSelected}
        startPos={startPos}
      />
    </BlockNodeWrapper>
  );
};

interface InlineNodeProps extends BaseNodeProps {
  index: number;
  node: ProsemirrorNode;
  background: string;
}

const InlineNode = (props: InlineNodeProps) => {
  const { node, background, startPos, index } = props;
  const marks =
    node.marks.length === 1
      ? ` - [${assertGet(node.marks, 0).type.name}]`
      : node.marks.length > 1
      ? ` - [${node.marks.length} marks]`
      : '';
  return (
    <InlineNodeView
      onClick={() => props.onNodeSelected({ node, pos: startPos })}
      background={background}
    >
      {index === 0 ? <Side>{startPos}</Side> : null}
      <Center>
        {node.type.name} {marks}
      </Center>
      <Side>{startPos + node.nodeSize}</Side>
    </InlineNodeView>
  );
};

export const StructureTab = (): JSX.Element => {
  const { state, nodeColors, selectedNode, actions } = useDebuggerStore();
  const selected = selectedNode ? selectedNode.node : state.doc;

  return (
    <SplitView>
      <SplitViewColumn grow>
        <Heading>Current Doc</Heading>
        <GraphWrapper>
          <BlockNode
            colors={nodeColors}
            node={state.doc}
            startPos={0}
            onNodeSelected={actions.selectNode}
          />
        </GraphWrapper>
      </SplitViewColumn>
      <SplitViewColumn sep minWidth={200} maxWidth={300}>
        <HeadingWithButton>
          <Heading>Node Info</Heading>
          <HeadingButton
            onClick={() => {
              // eslint-disable-next-line no-console
              return console.log(selected);
            }}
          >
            Log Node
          </HeadingButton>
        </HeadingWithButton>
        <JsonTree
          data={selected.toJSON()}
          hideRoot
          shouldExpandNode={() => (selected.type.name !== 'doc' ? true : false)}
        />
      </SplitViewColumn>
    </SplitView>
  );
};

const GraphWrapper = styled.div`
  margin-top: 12px;
`;

const BlockNodeWrapper = styled.div``;

const BlockNodeContentView = styled.div`
  padding: 0 12px;
  box-sizing: border-box;
  border-left: 1px solid ${mainTheme.white20};
  border-right: 1px solid ${mainTheme.white20};
`;

const BlockNodeContentViewWithInline = styled('div')({
  padding: '0 12px',
  display: 'flex',
  width: '100%',
  boxSizing: 'border-box',
  borderLeft: `1px solid ${mainTheme.white20}`,
  borderRight: `1px solid ${mainTheme.white20}`,
  flexWrap: 'wrap',
});

const BlockNodeView = styled.div<{ background: string }>`
  width: 100%;
  margin-bottom: 3px;
  box-sizing: border-box;
  display: flex;
  background: ${(props) => props.background};

  &:hover {
    cursor: pointer;
  }
`;

const Side = styled('div')({
  padding: '3px 6px',
  background: 'rgba(255, 255, 255, 0.3)',
});

const Center = styled('div')({
  flexGrow: 1,
  padding: '3px 9px',
  whiteSpace: 'pre',
});

const InlineNodeView = styled.div<{ background: string }>`
  flex-grow: 1;
  margin-bottom: 3px;
  display: flex;
  box-sizing: border-box;
  background: ${(props) => props.background};

  &:hover {
    cursor: pointer;
  }
`;
