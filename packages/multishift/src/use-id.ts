import * as React from 'react';

const useIsomorphicLayoutEffect =
  typeof document !== 'undefined' ? React.useLayoutEffect : React.useEffect;

let count = 0;
const genId = () => `multishift-id-${count++}`;

let serverHandoffComplete = false;

function useReact17Id() {
  const [id, setId] = React.useState(() => (serverHandoffComplete ? genId() : undefined));

  useIsomorphicLayoutEffect(() => {
    if (id == null) {
      setId(genId());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!serverHandoffComplete) {
      serverHandoffComplete = true;
    }
  }, []);

  return id;
}

// `toString()` prevents bundlers from trying to `import { useId } from 'react'`
const useReact18Id = (React as any)['useId'.toString()] as () => string;

const useId = useReact18Id || useReact17Id;

export { useId };
