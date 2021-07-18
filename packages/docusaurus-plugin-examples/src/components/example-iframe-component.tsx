import { useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import useBaseUrl from '@docusaurus/useBaseUrl';

import { BaseProps } from '../types';

interface IFrameProps extends Pick<BaseProps, 'name'> {}

function useIFrameLoading() {
  const [loading, setLoading] = useState(true);

  return useMemo(() => ({ loading, onLoad: () => setLoading(false) }), [loading]);
}

export const ExampleIFrame = (props: IFrameProps) => {
  const { name } = props;
  const { loading, onLoad } = useIFrameLoading();
  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0,
    triggerOnce: true,
  });

  const src = useBaseUrl(`/examples/${name}`);

  return (
    <div ref={ref}>
      {loading && <p>Loading...</p>}
      {inView && <iframe src={src} width='100%' height='100%' frameBorder='0' onLoad={onLoad} />}
    </div>
  );
};
