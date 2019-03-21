import React, { createContext, FC } from 'react';

/**
 * A proof of concept solution where the extensions are passed as react components
 */

/**
 * Creates a ReactContext for the Remirror component
 */
export const RemirrorContext = createContext({});

/**
 * Provides an extension manager which can be consumed by the remirror editor
 *
 * ```ts
 * <RemirrorEditorProvider>
 *   <Placeholder.Component {...options} />
 *   <Mention.Component onKeyDown={this.onKeyDown} />
 *   {injectedProps => <div />}
 * </RemirrorEditorProvider>
 */
export const RemirrorExtensionProvider: FC<any> = ({ children, ...props }) => {
  return (
    <Remirror {...props}>
      {value => <RemirrorContext.Provider value={value}>{children}</RemirrorContext.Provider>}
    </Remirror>
  );
};
