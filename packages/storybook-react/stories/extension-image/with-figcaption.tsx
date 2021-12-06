import 'remirror/styles/all.css';

import { ApplySchemaAttributes, NodeExtensionSpec, NodeSpecOverride } from 'remirror';
import { ImageExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

class FigcaptionExtension extends ImageExtension {
  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    const spec = super.createNodeSpec(extra, override);

    return {
      ...spec,
      attrs: {
        ...spec.attrs,
        figcaptionText: { default: '' },
      },
      toDOM: (node) => [
        'figure',
        {
          style: 'border: 2px solid #479e0c; padding: 8px; margin: 8px; text-align: center;',
        },
        spec.toDOM!(node),
        [
          'figcaption',
          { style: 'background-color: #3d3d3d; color: #f1f1f1; padding: 8px;' },
          node.attrs.figcaptionText,
        ],
      ],
    };
  }
}

const extensions = () => [new FigcaptionExtension()];

const WithFigcaption = (): JSX.Element => {
  const imageSrc = 'https://dummyimage.com/2000x800/479e0c/fafafa';

  const { manager, state, onChange } = useRemirror({
    extensions,
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'image',
              attrs: {
                height: 160,
                width: 400,
                src: imageSrc,
                figcaptionText: 'This is a <figcaption> element',
              },
            },
          ],
        },
      ],
    },
  });

  return (
    <ThemeProvider>
      <Remirror
        manager={manager}
        autoFocus
        onChange={onChange}
        initialContent={state}
        autoRender='end'
      />
    </ThemeProvider>
  );
};

export default WithFigcaption;
