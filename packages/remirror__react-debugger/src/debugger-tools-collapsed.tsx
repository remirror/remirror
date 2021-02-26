import { FloatingButton } from './components';

interface DebuggerToolsCollapsedProps {
  open: () => void;
}

export const DebuggerToolsCollapsed = (props: DebuggerToolsCollapsedProps): JSX.Element => {
  return (
    <FloatingButton onClick={props.open}>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width={530}
        height={530}
        viewBox='0 0 1024 1024'
        {...props}
      >
        <title>Remirror</title>
        <desc>Toggle button for Remirror Developer Tools</desc>
        <g fill='none' fillRule='evenodd'>
          <rect width={1024} height={1024} fill='#7963D2' fillRule='nonzero' rx={90} />
          <path fill='#FFF' fillRule='nonzero' opacity={0.15} d='M17 90h488v843H17z' />
          <path opacity={0.5} d='M519 90h488v843H519z' />
          <path
            fill='#FFF'
            fillRule='nonzero'
            d='M506 90h13v843h-13zM653.455 318.414c40.357-.532 80.038 9.915 114.4 30.118 10.052-18.488 30.051-30.099 51.876-30.118H872V725c-35.214 0-62.473-9.21-81.777-27.633-18.771-17.217-29.25-41.074-28.955-65.92V523.929c.336-27.54-11.052-54.032-31.559-73.411-19.74-20.063-47.419-31.268-76.254-30.87-24.883.303-48.787-9.236-66.037-26.353C569.008 375.725 559.87 350.627 560 318l93.455.414zm-282.957 0c-40.377-.532-80.079 9.915-114.459 30.118-10.056-18.488-30.065-30.099-51.901-30.118H152V725c35.232 0 62.505-9.21 81.818-27.633 18.781-17.217 29.266-41.074 28.97-65.92V523.929c-.337-27.54 11.058-54.032 31.575-73.411 19.713-20.024 47.34-31.226 76.135-30.87 24.895.303 48.812-9.236 66.07-26.353C454.987 375.725 464.13 350.627 464 318l-93.502.414z'
          />
        </g>
      </svg>
    </FloatingButton>
  );
};
