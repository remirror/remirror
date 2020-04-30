import { useEffect } from 'react';

import { useRemirror } from 'remirror';

export function useRemirrorPlayground() {
  // Serialize/deserialize
  const remirror = useRemirror();
  useEffect(() => {
    console.log(remirror.state.newState);
  }, [remirror.state.newState]);
}
