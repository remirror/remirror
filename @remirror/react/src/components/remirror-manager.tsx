import { ExtensionManager, PrioritizedExtension } from '@remirror/core';
import { baseExtensions } from '@remirror/core-extensions';
import {
  asDefaultProps,
  isReactFragment,
  isRemirrorExtension,
  RemirrorManagerProps,
} from '@remirror/react-utils';
import React, { Children, Component, ReactNode } from 'react';
import { RemirrorManagerContext } from '../react-contexts';

/**
 * This component consumes any directly nested RemirrorExtension components and creates a
 * manager instance which is passed into the created context for any children to consume.
 *
 * It allows for a more React-ish way of managing Prosemirror.
 */
export class RemirrorManager extends Component<RemirrorManagerProps> {
  public static defaultProps = asDefaultProps<RemirrorManagerProps>()({
    useBaseExtensions: true,
  });

  /**
   * Prepends the base extensions to the configured extensions where applicable.
   */
  private withBaseExtensions(extensions: PrioritizedExtension[]): PrioritizedExtension[] {
    const { useBaseExtensions } = this.props;
    const base = (useBaseExtensions ? baseExtensions : []).filter(
      ({ extension: { name } }) => !extensions.some(({ extension }) => extension.name === name),
    );

    return [...base, ...extensions];
  }

  private cachedManager: ExtensionManager = ExtensionManager.create(this.withBaseExtensions([]));

  /**
   * Calculate the manager based on the baseExtension and passed in props.
   */
  public get manager(): ExtensionManager {
    const extensions: PrioritizedExtension[] = [];

    const { children } = this.props;

    const resolvedChildren = Children.toArray(children).reduce((acc: ReactNode[], child: ReactNode) => {
      if (isReactFragment(child)) {
        return [...acc, ...Children.toArray(child.props.children)];
      } else {
        return [...acc, child];
      }
    }, []);

    resolvedChildren.forEach(child => {
      if (!isRemirrorExtension(child)) {
        return;
      }

      const { Constructor, children: _, priority = 2, ...options } = child.props;
      extensions.push({ extension: new Constructor(options), priority });
    });

    const newManager = ExtensionManager.create(this.withBaseExtensions(extensions));

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
