import type { ReactElement, ReactNode } from 'react';

import { AnyExtension, isNullOrUndefined } from '@remirror/core';
import { RemirrorPortals, usePortals } from '@remirror/extension-react-component';
import { Components } from '@remirror/theme';

import {
  I18nProps,
  I18nProvider,
  RemirrorContext,
  useReactFramework,
  useRemirrorContext,
} from './hooks';
import type { ReactFrameworkProps } from './react-framework';

/**
 * The props for the main `<Remirror />` component.
 */
export interface RemirrorProps<ExtensionUnion extends AnyExtension>
  extends Omit<ReactFrameworkProps<ExtensionUnion>, 'stringHandler'>,
    I18nProps {
  /**
   * The optional children which can be passed into the [`Remirror`].
   */
  children?: ReactNode;

  /**
   * Set this to `start` or `end` to automatically render the editor to the dom.
   *
   * When set to `start` the editor will be added before all other child
   * components. If `end` the editable editor will be added after all child
   * components.
   *
   * When no children are provided the editor will automatically be rendered
   * even without this prop being set.
   *
   * `start` is the preferred value since it helps avoid some of the issues that
   * can arise from `zIndex` issues with floating components rendered within the
   * context.
   *
   * @default undefined
   */
  autoRender?: boolean | 'start' | 'end';

  /**
   * An array of hooks that can be passed through to the `Remirror` component
   * and will be called in the order provided. Each hook receives no props but
   * will have access to the `RemirrorContext`.
   *
   * If you'd like access to more
   * state, you can wrap the `Remirror` component in a custom provider and
   * attach your state there. It can then be accessed inside the hook via
   * context.
   */
  hooks?: Array<() => void>;
}

/**
 * The default editor placeholder where the prosemirror editor will be rendered.
 */
export const EditorComponent = (): JSX.Element => {
  return <div className={Components.EDITOR_WRAPPER} {...useRemirrorContext().getRootProps()} />;
};

interface HookComponentProps {
  hook: () => void;
}

/**
 * A component which exists to call a prop-less hook.
 */
const HookComponent = (props: HookComponentProps) => {
  props.hook();
  return null;
};

/**
 * [[`Remirror`]] is the component for putting the editor into into it's child
 * component.
 *
 * @remarks
 *
 * The main component for remirror. This acts both as a Provider of the remirror
 * context. All components rendered within `Remirror` have access to the
 * remirror context via `useRemirrorContext`.
 *
 * I can also be rendered as a standalone editor without children. In this case
 * the context can be accessed from outside the editor via
 * `useRemirror().getContext()`.
 */
export const Remirror = <ExtensionUnion extends AnyExtension>(
  props: RemirrorProps<ExtensionUnion>,
): ReactElement<RemirrorProps<ExtensionUnion>> => {
  const {
    children,
    autoRender,
    i18n,
    locale,
    supportedLocales,
    hooks = [],
    ...frameworkProps
  } = props;
  const context = useReactFramework(frameworkProps);

  // Subscribe to updates from the [[`PortalContainer`]]
  const portals = usePortals(context.portalContainer);

  // A boolean flag which is true when a default editor should be rendered
  // first. If no children are provided and no configuration is provided for
  // autoRender, the editor will automatically be rendered.
  const autoRenderAtStart =
    autoRender === 'start' || autoRender === true || (!children && isNullOrUndefined(autoRender));

  // Whether to render the editor at the end of the editor.
  const autoRenderAtEnd = autoRender === 'end';

  return (
    <I18nProvider i18n={i18n} locale={locale} supportedLocales={supportedLocales}>
      <RemirrorContext.Provider value={context}>
        <RemirrorPortals portals={portals} />
        {hooks.map((hook, index) => (
          <HookComponent hook={hook} key={index} />
        ))}
        {autoRenderAtStart && <EditorComponent />}
        {children}
        {autoRenderAtEnd && <EditorComponent />}
      </RemirrorContext.Provider>
    </I18nProvider>
  );
};
