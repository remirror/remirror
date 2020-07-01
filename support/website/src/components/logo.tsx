import React from 'react';

type SvgProps = JSX.IntrinsicElements['svg'];

interface LogoProps extends SvgProps {
  size?: number | string;
  type?: 'light' | 'dark';
}

export const Logo = (props: LogoProps) => {
  const { size = 512, type = 'dark', ...rest } = props;

  switch (type) {
    case 'light':
      return (
        <svg
          {...rest}
          id='prefix__Layer_1'
          data-name='Layer 1'
          viewBox='0 0 450 450'
          overflow='visible'
        >
          <title>Remirror Logo</title>
          <path fill='#c3b9eb' opacity={0.4} d='M50 68.33h172.46v313.35H50z' />
          <path fill='none' opacity={0.5} d='M227.54 68.33H400v313.35H227.54z' />
          <path
            fill='#7963d2'
            d='M222.46 68.33h5.08v313.35h-5.08zM275.09 153.76q22.55 0 40.55 11.19A20.72 20.72 0 01334 153.76h18.6V304.9q-18.75 0-29-10.28a33.46 33.46 0 01-10.28-24.51v-39.93a37.72 37.72 0 00-11.17-27.3 36.42 36.42 0 00-27-11.45 32 32 0 01-23.44-9.73q-9.72-9.73-9.73-27.94zM174.91 153.76q-22.54 0-40.55 11.19A20.72 20.72 0 00116 153.76H97.4V304.9q18.75 0 29-10.28a33.46 33.46 0 0010.28-24.51v-39.93a37.72 37.72 0 0111.17-27.3 36.42 36.42 0 0127-11.45 32 32 0 0023.44-9.73q9.72-9.73 9.73-27.94z'
          />
        </svg>
      );

    default:
      return (
        <svg
          id='prefix__Layer_1'
          data-name='Layer 1'
          viewBox='0 0 450 450'
          width={size}
          height={size}
          {...rest}
        >
          <title>Remirror Logo</title>
          <path fill='#7963d2' d='M0 0h450v450H0z' />
          <path opacity={0.15} fill='#fff' d='M50 68.33h172.46v313.35H50z' />
          <path fill='none' opacity={0.5} d='M227.54 68.33H400v313.35H227.54z' />
          <path
            fill='#fff'
            d='M222.46 68.33h5.08v313.35h-5.08zM275.09 153.76q22.55 0 40.55 11.19A20.72 20.72 0 01334 153.76h18.6V304.9q-18.75 0-29-10.28a33.46 33.46 0 01-10.28-24.51v-39.93a37.72 37.72 0 00-11.17-27.3 36.42 36.42 0 00-27-11.45 32 32 0 01-23.44-9.73q-9.72-9.73-9.73-27.94zM174.91 153.76q-22.54 0-40.55 11.19A20.72 20.72 0 00116 153.76H97.4V304.9q18.75 0 29-10.28a33.46 33.46 0 0010.28-24.51v-39.93a37.72 37.72 0 0111.17-27.3 36.42 36.42 0 0127-11.45 32 32 0 0023.44-9.73q9.72-9.73 9.73-27.94z'
          />
        </svg>
      );
  }
};

export default Logo;
