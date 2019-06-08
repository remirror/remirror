import { Cast } from '@remirror/core';
import { GetPositionerReturn, InjectedRemirrorProps, UsePositionerParams } from '@remirror/react-utils';
import hoistNonReactStatics from 'hoist-non-react-statics';
import React, { ComponentType, FunctionComponent } from 'react';
import { RemirrorEditorContext } from './contexts';

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
          if (!params) {
            throw new Error('No props received for the RemirrorProvider component');
          }
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
        {params => {
          if (!params) {
            throw new Error('No props received for the RemirrorProvider component');
          }
          return (
            <WrappedComponent
              {...Cast<GProps>({
                ...props,
                ...params.getPositionerProps<GRefKey>({ ...positioner, ...rest }),
              })}
            />
          );
        }}
      </RemirrorEditorContext.Consumer>
    );
  };

  return hoistNonReactStatics(EnhancedComponent, WrappedComponent);
};
