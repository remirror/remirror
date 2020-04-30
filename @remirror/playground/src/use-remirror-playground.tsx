import { useEffect } from 'react';

import { useRemirror } from '@remirror/react';

export function useRemirrorPlayground() {
  // Serialize/deserialize
  const remirror = useRemirror();
  useEffect(() => {
    console.log(remirror.state.newState);
  }, [remirror.state.newState]);
}
