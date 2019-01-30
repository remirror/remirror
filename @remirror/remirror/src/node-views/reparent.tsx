import React, { PureComponent } from 'react';

/**
 * To avoid using unstable/deprecated API, here is an example that might be helpful to anyone looking for a practical approach of re-parenting using portals (CodePen):
 */
export class ReParent extends PureComponent<{ el: HTMLElement }> {
  private readonly ref = React.createRef<HTMLDivElement>();

  public componentDidMount() {
    this.ref.current!.appendChild(this.props.el);
  }

  public render() {
    return <div ref={this.ref} />;
  }
}
