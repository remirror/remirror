import React, { ComponentType, createContext, FC, FunctionComponent } from 'react';

import hoistNonReactStatics from 'hoist-non-react-statics';
import { isEmpty } from 'lodash';
import { Omit } from 'simplytyped';
import { Cast } from './helpers';
import { InjectedRemirrorProps, Remirror, RemirrorProps } from './remirror';

const TextEditorContext = createContext<InjectedRemirrorProps>(Cast<InjectedRemirrorProps>({}));

export const TextEditorProvider: FC<RemirrorProps> = ({ children, ...props }) => {
  return (
    <Remirror {...props}>
      {value => <TextEditorContext.Provider value={value}>{children}</TextEditorContext.Provider>}
    </Remirror>
  );
};

const checkValidRenderPropParams = (params: InjectedRemirrorProps) => {
  if (isEmpty(params)) {
    throw new Error('No props received for the Text Editor Params');
  }
  return true;
};

export const withTextEditor = <P extends InjectedRemirrorProps>(Wrapped: ComponentType<P>) => {
  const EnhancedComponent: FunctionComponent<Omit<P, keyof InjectedRemirrorProps>> = props => {
    return (
      <TextEditorContext.Consumer>
        {params => {
          checkValidRenderPropParams(params);
          const p = { ...props, ...params };
          return <Wrapped {...Cast(p)} />;
        }}
      </TextEditorContext.Consumer>
    );
  };

  return hoistNonReactStatics(EnhancedComponent, Wrapped);
};
