import React from 'react';
import { createPortal, unmountComponentAtNode, unstable_renderSubtreeIntoContainer } from 'react-dom';

import { NodeViewPortalContainer } from '@remirror/core';

export interface NodeViewPortalProps {
  children: (nodeViewPortalContainer: NodeViewPortalContainer) => React.ReactChild | null;
}

export interface PortalRendererState {
  portals: Map<HTMLElement, React.ReactChild>;
}

export class NodeViewPortal extends React.Component<NodeViewPortalProps> {
  public nodeViewPortalContainer: NodeViewPortalContainer;

  constructor(props: NodeViewPortalProps) {
    super(props);
    this.nodeViewPortalContainer = new NodeViewPortalContainer(
      unstable_renderSubtreeIntoContainer,
      unmountComponentAtNode,
    );
  }

  public render() {
    return this.props.children(this.nodeViewPortalContainer);
  }

  public componentDidUpdate() {
    this.nodeViewPortalContainer.forceUpdate();
  }
}

export interface NodeViewPortalComponentProps {
  nodeViewPortalContainer: NodeViewPortalContainer;
}

export class NodeViewPortalComponent extends React.Component<
  NodeViewPortalComponentProps,
  PortalRendererState
> {
  constructor(props: NodeViewPortalComponentProps) {
    super(props);
    props.nodeViewPortalContainer.setContext(this);
    // props.nodeViewPortalContainer.on('update', this.handleUpdate);
    this.state = { portals: new Map() };
  }

  // private handleUpdate = portals => this.setState({ portals });

  public render() {
    const { portals } = this.state;
    return (
      <>{Array.from(portals.entries()).map(([container, children]) => createPortal(children, container))}</>
    );
  }
}
