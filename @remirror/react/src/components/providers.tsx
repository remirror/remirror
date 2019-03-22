import React, { ComponentType, FunctionComponent } from 'react';

import { Cast, isEmptyObject, MakeOptional, Omit } from '@remirror/core';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { RemirrorEditorContext } from '../contexts';
import { defaultProps } from '../helpers';
import { useRemirrorManagerContext } from '../hooks';
import {
  GetPositionerReturn,
  InjectedRemirrorProps,
  RemirrorElementType,
  RemirrorFC,
  RemirrorProps,
  UsePositionerParams,
} from '../types';
import { Remirror } from './remirror';

export type RemirrorProviderProps = MakeOptional<Omit<RemirrorProps, 'children'>, keyof typeof defaultProps>;

/**
 * The RemirrorProvider which injects context into any of it child components.
 *
 * These can either be consumed using React Hooks
 * - `useRemirrorContext`
 * - `usePositioner`
 *
 * Or the higher order components
 * - `withRemirror`
 * - `withPositioner`
 */
export const RemirrorEditor: RemirrorFC<RemirrorProviderProps> = ({ children, ...props }) => {
  return (
    <Remirror {...props}>
      {value => <RemirrorEditorContext.Provider value={value}>{children}</RemirrorEditorContext.Provider>}
    </Remirror>
  );
};

RemirrorEditor.$$remirrorType = RemirrorElementType.EditorProvider;

/**
 * Renders the content while pulling the manager from the context and passing it on to the
 * RemirrorProvider.
 *
 * If no manager exists the child components are not rendered.
 */
export const ManagedRemirrorEditor: RemirrorFC<Omit<RemirrorProviderProps, 'manager'>> = ({
  children,
  ...props
}) => {
  const manager = useRemirrorManagerContext();

  return manager ? (
    <RemirrorEditor {...props} manager={manager}>
      {children}
    </RemirrorEditor>
  ) : null;
};

ManagedRemirrorEditor.$$remirrorType = RemirrorElementType.ManagedEditorProvider;

const checkValidRenderPropParams = (params: InjectedRemirrorProps) => {
  if (isEmptyObject(params)) {
    throw new Error('No props received for the RemirrorProvider component');
  }
  return true;
};

/**
 * A higher order component which passes the RemirrorContext to the component it wraps.
 *
 * @param WrappedComponent
 */
export const withRemirror = <GProps extends InjectedRemirrorProps>(
  WrappedComponent: ComponentType<GProps>,
) => {
  type EnhancedComponentProps = Omit<GProps, keyof InjectedRemirrorProps>;
  const EnhancedComponent: FunctionComponent<EnhancedComponentProps> = props => {
    return (
      <RemirrorEditorContext.Consumer>
        {params => {
          checkValidRenderPropParams(params);
          return <WrappedComponent {...Cast<GProps>({ ...props, ...params })} />;
        }}
      </RemirrorEditorContext.Consumer>
    );
  };

  return hoistNonReactStatics(EnhancedComponent, WrappedComponent);
};

/**
 * A higher order component which passes the positioner props to the component it wraps.
 * This is useful for creating menus which need access to position information
 *
 * @param params
 */
export const withPositioner = <GRefKey extends string = 'ref'>({
  positioner,
  ...rest
}: UsePositionerParams<GRefKey>) => <GProps extends GetPositionerReturn<GRefKey>>(
  WrappedComponent: ComponentType<GProps>,
) => {
  type EnhancedComponentProps = Omit<GProps, keyof GetPositionerReturn<GRefKey>>;
  const EnhancedComponent: FunctionComponent<EnhancedComponentProps> = props => {
    return (
      <RemirrorEditorContext.Consumer>
        {({ getPositionerProps }) => {
          return (
            <WrappedComponent
              {...Cast<GProps>({ ...props, ...getPositionerProps<GRefKey>({ ...positioner, ...rest }) })}
            />
          );
        }}
      </RemirrorEditorContext.Consumer>
    );
  };

  return hoistNonReactStatics(EnhancedComponent, WrappedComponent);
};
