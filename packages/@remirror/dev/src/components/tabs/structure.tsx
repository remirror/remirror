import styled from '@emotion/styled';
import React from 'react';
import { Subscribe } from 'unstated';

import theme from '../../dev-constants';
import JSONTree from '../components/json-tree.tsv';
import { SplitView, SplitViewColumn } from '../components/split-view';
import EditorStateContainer from '../state/editor';
import StructureTabStateContainer from '../state/structure-tab';
import { Heading, HeadingButton, HeadingWithButton } from './../components/heading';

const GraphWrapper = styled('div')({
  marginTop: '12px',
});
GraphWrapper.displayName = 'GraphWrapper';

const BlockNodeWrapper = styled('div')({});
BlockNodeWrapper.displayName = 'BlockNodeWrapper';

const BlockNodeContentView = styled('div')({
  padding: '0 12px',
  boxSizing: 'border-box',
  borderLeft: `1px solid ${theme.white20}`,
  borderRight: `1px solid ${theme.white20}`,
});
BlockNodeContentView.displayName = 'BlockNodeContentView';

const BlockNodeContentViewWithInline = styled('div')({
  padding: '0 12px',
  display: 'flex',
  width: '100%',
  boxSizing: 'border-box',
  borderLeft: `1px solid ${theme.white20}`,
  borderRight: `1px solid ${theme.white20}`,
  flexWrap: 'wrap',
});
BlockNodeContentViewWithInline.displayName = 'BlockNodeContentViewWithInline';

const BlockNodeView = styled('div')(
  {
    width: '100%',
    marginBottom: '3px',
    boxSizing: 'border-box',
    display: 'flex',

    '&:hover': {
      cursor: 'pointer',
    },
  },
  ({ bg }) => ({
    background: bg,
  }),
);
BlockNodeView.displayName = 'BlockNodeView';

const Side = styled('div')({
  padding: '3px 6px',
  background: 'rgba(255, 255, 255, 0.3)',
});
Side.displayName = 'Side';

const Center = styled('div')({
  flexGrow: 1,
  padding: '3px 9px',
  whiteSpace: 'pre',
});
Center.displayName = 'Center';

const InlineNodeView = styled('div')(
  {
    flexGrow: 1,
    marginBottom: '3px',
    display: 'flex',
    boxSizing: 'border-box',

    '&:hover': {
      cursor: 'pointer',
    },
  },
  ({ bg }) => ({
    background: bg,
  }),
);
InlineNodeView.displayName = 'InlineNodeView';

export function BlockNodeContent(props) {
  if (!props.content || !props.content.content || !props.content.content.length) {
    return null;
  }

  const content = props.content.content;

  if (content[0].isBlock) {
    let startPos = props.startPos + 1;
    return (
      <BlockNodeContentView>
        {content.map((childNode, index) => {
          const pos = startPos;
          startPos += childNode.nodeSize;
          return (
            <BlockNode
              key={index}
              node={childNode}
              colors={props.colors}
              onNodeSelected={props.onNodeSelected}
              startPos={pos}
            />
          );
        })}
      </BlockNodeContentView>
    );
  }

  let startPos = props.startPos;
  return (
    <BlockNodeContentViewWithInline>
      {content.map((childNode, index) => {
        const pos = startPos;
        startPos += childNode.nodeSize;
        return (
          <InlineNode
            key={index}
            index={index}
            node={childNode}
            bg={props.colors[childNode.type.name]}
            onNodeSelected={props.onNodeSelected}
            startPos={pos}
          />
        );
      })}
    </BlockNodeContentViewWithInline>
  );
}

export function BlockNode(props) {
  const { colors, node, startPos } = props;
  const color = colors[node.type.name];
  return (
    <BlockNodeWrapper>
      <BlockNodeView bg={color} onClick={() => props.onNodeSelected({ node })}>
        <Side>{startPos}</Side>
        <Center>{node.type.name}</Center>
        <Side>{startPos + node.nodeSize - 1}</Side>
      </BlockNodeView>
      <BlockNodeContent
        content={node.content}
        colors={colors}
        onNodeSelected={props.onNodeSelected}
        startPos={startPos}
      />
    </BlockNodeWrapper>
  );
}

export function InlineNode(props) {
  const { node, bg, startPos, index } = props;
  const marks =
    node.marks.length === 1
      ? ` - [${node.marks[0].type.name}]`
      : node.marks.length > 1
      ? ` - [${node.marks.length} marks]`
      : '';
  return (
    <InlineNodeView onClick={() => props.onNodeSelected({ node })} bg={bg}>
      {index === 0 ? <Side>{startPos}</Side> : null}
      <Center>
        {node.type.name} {marks}
      </Center>
      <Side>{startPos + node.nodeSize}</Side>
    </InlineNodeView>
  );
}

export const StructureTab = (): JSX.Element => {
  return (
    <Subscribe to={[EditorStateContainer, StructureTabStateContainer]}>
      {(editorState, structureTabState) => {
        const { state, nodeColors } = editorState.state;
        const { selectedNode } = structureTabState.state;
        const selected = selectedNode ? selectedNode : state.doc;

        return (
          <SplitView>
            <SplitViewColumn grow>
              <Heading>Current Doc</Heading>
              <GraphWrapper>
                <BlockNode
                  colors={nodeColors}
                  node={state.doc}
                  startPos={0}
                  onNodeSelected={structureTabState.selectNode}
                />
              </GraphWrapper>
            </SplitViewColumn>
            <SplitViewColumn sep minWidth={200} maxWidth={300}>
              <HeadingWithButton>
                <Heading>Node Info</Heading>
                <HeadingButton onClick={() => console.log(selected)}>Log Node</HeadingButton>
              </HeadingWithButton>
              <JSONTree
                data={selected.toJSON()}
                hideRoot
                shouldExpandNode={() => (selected.type.name !== 'doc' ? true : false)}
              />
            </SplitViewColumn>
          </SplitView>
        );
      }}
    </Subscribe>
  );
};
