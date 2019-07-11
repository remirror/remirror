import { ExtensionManager, isString, PrioritizedExtension } from '@remirror/core';
import { baseExtensions, PlaceholderExtension } from '@remirror/core-extensions';
import {
  asDefaultProps,
  isReactFragment,
  isRemirrorExtension,
  RemirrorManagerProps,
} from '@remirror/react-utils';
import React, { Children, Component, ReactNode } from 'react';
import { RemirrorManagerContext } from '../contexts';

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

  private get baseExtensions(): PrioritizedExtension[] {
    const { placeholder, useBaseExtensions } = this.props;
    const withPlaceholder: PrioritizedExtension[] = placeholder
      ? [
          {
            extension: new PlaceholderExtension(
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
