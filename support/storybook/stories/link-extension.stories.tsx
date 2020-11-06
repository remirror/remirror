import React, { FC, useEffect } from 'react';
import { LinkExtension, LinkOptions } from 'remirror/extension/link';
import { RemirrorProvider, useManager, useRemirror } from 'remirror/react';

export default { title: 'Link extension' };

const SmallEditor: FC = () => {
  const { getRootProps, setContent, commands } = useRemirror();

  useEffect(() => {
    setContent({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'www.remirror.io',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: 'https://www.remirror.io',
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  }, [setContent, commands]);

  return <div {...getRootProps()} />;
};

export const Basic = (args: LinkOptions) => {
  const extensionManager = useManager([new LinkExtension(args)]);

  return (
    <RemirrorProvider manager={extensionManager}>
      <SmallEditor />
    </RemirrorProvider>
  );
};
Basic.args = {
  autoLink: true,
  openLinkOnClick: true,
};
