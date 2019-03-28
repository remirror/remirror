import React, { Children, Component } from 'react';

import { ExtensionManager, ExtensionMapValue } from '@remirror/core';
import { baseExtensions } from '@remirror/core-extensions';
import { RemirrorManagerContext } from '../contexts';
import { asDefaultProps, isRemirrorExtension } from '../helpers';
import { RemirrorManagerProps } from '../types';

export class RemirrorManager extends Component<RemirrorManagerProps> {
  public static defaultProps = asDefaultProps<RemirrorManagerProps>()({
    useBaseExtensions: true,
  });

  private get baseExtensions(): ExtensionMapValue[] {
    return this.props.useBaseExtensions ? baseExtensions : [];
  }

  private cachedManager: ExtensionManager = ExtensionManager.create(this.baseExtensions);

  /**
   * Calculate the manager based on the baseExtension and passed in props.
   */
  public get manager(): ExtensionManager {
    const extensions: ExtensionMapValue[] = [...this.baseExtensions];
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
