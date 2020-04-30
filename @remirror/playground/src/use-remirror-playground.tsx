import { useEffect } from 'react';

import { InjectedRenderEditorProps } from 'remirror';

export function useRemirrorPlayground(remirror: InjectedRenderEditorProps<any>) {
  // Serialize/deserialize
  useEffect(() => {
    console.log(remirror.state.newState);
  }, [remirror.state.newState]);
}
