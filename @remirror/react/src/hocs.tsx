import { Cast, isEmptyObject, Omit } from '@remirror/core';
import hoistNonReactStatics from 'hoist-non-react-statics';
import React, { ComponentType, FunctionComponent } from 'react';
import { RemirrorEditorContext } from './contexts';
import { GetPositionerReturn, InjectedRemirrorProps, UsePositionerParams } from './types';

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
