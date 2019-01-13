import React, { ComponentType, createRef, PureComponent, RefAttributes } from 'react';

import { EditorView } from 'prosemirror-view';
import { EditorSchema } from '../types';

interface FloatingMenuProps {
  view: EditorView<EditorSchema>;
  Component: ComponentType<State['position'] & RefAttributes<HTMLElement>>;
}

interface State {
  position: {
    left: number;
    top: number;
  };
}
export class FloatingMenu extends PureComponent<FloatingMenuProps, State> {
  private floatingMenu = createRef<HTMLElement>();

  public state = {
    position: {
      left: 0,
      top: 0,
    },
  };

  public componentDidMount() {
    this.setState({
      position: this.calculateStyle(this.props),
    });
  }

  public componentWillReceiveProps(nextProps: FloatingMenuProps) {
    this.setState({
      position: this.calculateStyle(nextProps),
    });
  }

  public render() {
    const { Component } = this.props;
    const { position } = this.state;
    return (
      <Component ref={this.floatingMenu} {...position}>
        {this.props.children}
      </Component>
    );
  }

  public calculateStyle(props: FloatingMenuProps) {
    const { view } = props;

    const { selection } = view.state;

    if (!selection || selection.empty || !this.floatingMenu.current) {
      return {
        left: -1000,
        top: 0,
      };
    }

    const coords = view.coordsAtPos(selection.$anchor.pos);

    const { offsetWidth } = this.floatingMenu.current;

    return {
      left:
        window.innerWidth - offsetWidth < coords.left
          ? coords.left - offsetWidth + 20
          : coords.left,
      top: coords.top - 40 > 0 ? coords.top - 40 : coords.top + 20,
    };
  }
}
