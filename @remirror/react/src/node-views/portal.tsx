import React, { Component, Fragment } from 'react';
import { createPortal } from 'react-dom';

import { NodeViewPortalComponentProps, NodeViewPortalContainer, PortalList, PortalMap } from '@remirror/core';

export interface NodeViewPortalProps {
  children: (nodeViewPortalContainer: NodeViewPortalContainer) => JSX.Element;
}

export interface PortalRendererState {
  portals: PortalList;
}

export class NodeViewPortalComponent extends Component<NodeViewPortalComponentProps, PortalRendererState> {
  public state = {
    portals: Array.from(this.props.nodeViewPortalContainer.portals.entries()),
  };

  private disposeListener!: () => void;

  constructor(props: NodeViewPortalComponentProps) {
    super(props);
    // props.nodeViewPortalContainer.setContext(this);
    this.disposeListener = this.props.nodeViewPortalContainer.on(this.onPortalChange);
  }

  private onPortalChange = (portalMap: PortalMap) => {
    const portals = Array.from(portalMap.entries());
    this.setState({ portals });
  };

  public componentWillUnmount() {
    this.disposeListener();
  }

  public render() {
    const { portals } = this.state;

    return (
      <>
        {portals.map(([container, { children, key }]) => (
          <Fragment key={key}>{createPortal(children(), container)}</Fragment>
        ))}
      </>
    );
  }
}
