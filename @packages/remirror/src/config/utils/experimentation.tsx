// tslint:disable max-classes-per-file no-any
import { Node } from 'prosemirror-model';
import { NodeView } from 'prosemirror-view';
import React, { Component, createRef, FunctionComponent } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

const UnderlinedText: FunctionComponent<JSX.IntrinsicElements['span']> = props => (
  <span {...props} />
);

/**
 * Here we have the (too simple) React component which
 * we'll be rendering content into.
 */
class Underlined extends Component<{}, { html: string }> {
  public state = { html: '' };
  public hole = createRef<HTMLSpanElement>();

  /**
   * We'll put the content into what we render using
   * this function, which appends a given node to
   * a ref HTMLElement, if present.
   */
  public append(html: string) {
    // if (this.hole.current) {
    //   this.hole.current.appendChild(node);
    // }
    this.setState({ html });
  }

  public render() {
    /* We want to render the content dom node in the styled component. */
    return <UnderlinedText ref={this.hole} dangerouslySetInnerHTML={{ __html: this.state.html }} />;
  }
}

/**
 * This class is our actual interactor for ProseMirror itself.
 * It glues DOM rendering, React, and ProseMirror nodes together.
 */
export class Underline implements NodeView {
  /**
   * Here, we'll provide a container to render React into.
   * Coincidentally, this is where ProseMirror will put its
   * generated contentDOM.  React will throw out that content
   * once rendered, and at the same time we'll append it into
   * the component tree, like a fancy shell game.  This isn't
   * obvious to the user, but would it be more obvious on an
   * expensive render?
   */
  public dom = document.createElement('span');

  /**
   * Finally, we provide an element to render content into.
   * We will be moving this node around as we need to.
   */
  public contentDOM = document.createElement('span');

  /**
   * We'll use this to access our Underlined component's
   * instance methods.
   */
  public ref = createRef<Underlined>();

  constructor(public node: Node) {
    // console.log('Constructed UNDERLINE here!');
    render(<Underlined ref={this.ref} />, this.dom, this.putContentDomInRef);
  }

  public update = (_: Node) => {
    // console.log('Updating UNDERLINE', _);
    return false;
  };

  /**
   * This is the least complex part.  Now we've put
   * all of our interlocking pieces behind refs and
   * instance properties, this becomes the callback
   * which performs the actual shell game.
   */
  private putContentDomInRef = () => {
    if (this.ref.current) {
      // console.log('Placing UNDERLINE content in dom');
      // this.ref.current.append(this.contentDOM);
      this.ref.current.append(this.contentDOM.innerHTML);
    }
  };

  public destroy = () => {
    // console.log('Destroying UNDERLINE');
    unmountComponentAtNode(this.dom);
  };
}

export const underLineNodeView = (node: Node) => new Underline(node);
