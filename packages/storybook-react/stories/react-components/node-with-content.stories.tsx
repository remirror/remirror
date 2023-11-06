import './style/card.css';

import React, { ComponentType } from 'react';
import {
  DOMCompatibleAttributes,
  ExtensionTag,
  NodeExtension,
  NodeExtensionSpec,
} from '@remirror/core';
import { EditorComponent, NodeViewComponentProps, Remirror, useRemirror } from '@remirror/react';

const userAttrs = {
  id: 'randomId',
  name: 'John Doe',
  src: 'https://dummyimage.com/2000x800/479e0c/fafafa',
};
const UserCardContent = `<div data-user-id="${userAttrs.id}" data-user-name="${userAttrs.name}" data-user-image-url="${userAttrs.src}"><p>This is editable content...</p></div>`;

export default { title: 'Components / Card with content' };

class UserCardExtension extends NodeExtension {
  get name() {
    return 'user-card' as const;
  }

  ReactComponent: ComponentType<NodeViewComponentProps> = ({ node, forwardRef }) => {
    const { name, imageSrc } = node.attrs;

    return (
      <div className='card'>
        <div contentEditable='false'>
          <img src={imageSrc} alt='Avatar' style={{ width: '100%' }} />
          <h4>
            <b>{name}</b>
          </h4>
          <span>Write user description below</span>
        </div>
        <p ref={forwardRef} />
      </div>
    );
  };

  createTags() {
    return [ExtensionTag.Block];
  }
  createNodeSpec(): NodeExtensionSpec {
    return {
      attrs: {
        id: { default: null },
        name: { default: '' },
        imageSrc: { default: '' },
      },
      content: 'block*',
      toDOM: (node) => {
        const attrs: DOMCompatibleAttributes = {
          'data-user-id': node.attrs.id,
          'data-user-name': node.attrs.name,
          'data-user-image-url': node.attrs.imageSrc,
        };
        return ['div', attrs, 0];
      },
      parseDOM: [
        {
          attrs: {
            id: { default: null },
            name: { default: '' },
            imageSrc: { default: '' },
          },
          tag: 'div[data-user-id]',
          getAttrs: (dom) => {
            const node = dom as HTMLAnchorElement;
            const id = node.getAttribute('data-user-id');
            const name = node.getAttribute('data-user-name');
            const imageSrc = node.getAttribute('data-user-image-url');

            return {
              id,
              name,
              imageSrc,
            };
          },
        },
      ],
    };
  }
}

const extensions = () => [new UserCardExtension({ disableExtraAttributes: true })];

export const UserCard = () => {
  const { manager, state } = useRemirror({
    extensions,
    content: UserCardContent,
    stringHandler: 'html',
  });

  return (
    <Remirror manager={manager} initialContent={state} autoFocus>
      <EditorComponent />
    </Remirror>
  );
};
