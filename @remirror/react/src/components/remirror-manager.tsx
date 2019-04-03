import React, { Children, Component } from 'react';

import { ExtensionManager, isString, PrioritizedExtension } from '@remirror/core';
import { baseExtensions, Placeholder } from '@remirror/core-extensions';
import { asDefaultProps, isRemirrorExtension, RemirrorManagerProps } from '@remirror/react-utils';
import { RemirrorManagerContext } from '../contexts';

export class RemirrorManager extends Component<RemirrorManagerProps> {
  public static defaultProps = asDefaultProps<RemirrorManagerProps>()({
    useBaseExtensions: true,
  });

  private get baseExtensions(): PrioritizedExtension[] {
    const { placeholder, useBaseExtensions } = this.props;
    const withPlaceholder: PrioritizedExtension[] = placeholder
      ? [
          {
            extension: new Placeholder(
              isString(placeholder)
                ? { placeholder }
                : { placeholder: placeholder[0], placeholderStyle: placeholder[1] },
            ),
            priority: 3,
          },
        ]
      : [];

    return useBaseExtensions ? baseExtensions.concat(withPlaceholder) : withPlaceholder;
  }

  private cachedManager: ExtensionManager = ExtensionManager.create(this.baseExtensions);

  /**
   * Calculate the manager based on the baseExtension and passed in props.
   */
  public get manager(): ExtensionManager {
    const extensions: PrioritizedExtension[] = [...this.baseExtensions];
    Children.forEach(this.props.children, child => {
      if (!isRemirrorExtension(child)) {
        return;
      }

      const { Constructor, children: _, priority = 2, ...options } = child.props;
      extensions.push({ extension: new Constructor(options), priority });
    });

    const newManager = ExtensionManager.create(extensions);

    // Only update the manager when it has changed to prevent unnecessary re-rendering
    if (newManager.isEqual(this.cachedManager)) {
      return this.cachedManager;
    }

    this.cachedManager = newManager;
    return newManager;
  }

  public render() {
    return (
      <RemirrorManagerContext.Provider value={this.manager}>
        {this.props.children}
      </RemirrorManagerContext.Provider>
    );
  }
}
