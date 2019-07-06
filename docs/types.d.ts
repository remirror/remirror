declare module 'react-wait' {
  import { ComponentType, FunctionComponent } from 'react';
  export const Waiter: FunctionComponent<{}>;

  export interface WaitProps {
    fallback: JSX.Element;
    on: string;
  }

  export interface UseWaitAPI {
    /**
     * Using Wait Component
     *
     * ```tsx
     * function Component() {
     *   const { Wait } = useWait();
     *   return (
     *     <Wait on="the waiting message" fallback={<div>Waiting...</div>}>
     *       The content after waiting done
     *     </Wait>
     *   );
     * }
     * ```
     *
     * Better example for a button with loading state:
     * ```tsx
     * <button disabled={isWaiting("creating user")}>
     *   <Wait on="creating user" fallback={<div>Creating User...</div>}>
     *     Create User
     *   </Wait>
     * </button>
     * ```
     */
    Wait: ComponentType<WaitProps>;
    /**
     * Returns boolean value if any loader exists in context.
     *
     * ```tsx
     * const { anyWaiting } = useWait();
     * return <button disabled={anyWaiting()}>Disabled while waiting</button>;
     * ```
     */
    anyWaiting(): boolean;
    /**
     * Returns boolean value if given loader exists in context.
     *
     * ```tsx
     * const { isWaiting } = useWait();
     * return (
     *   <button disabled={isWaiting("creating user")}>
     *     Disabled while creating user
     *   </button>
     * );
     * ```
     */
    isWaiting(waiter: string): boolean;
    /**
     * Starts the given waiter.
     *
     * ```tsx
     * const { startWaiting } = useWait();
     * return <button onClick={() => startWaiting("message")}>Start</button>;
     * ```
     */
    startWaiting(waiter: string): void;

    /**
     * Stops the given waiter.
     *
     * ```tsx
     * const { end } = useWait();
     * return <button onClick={() => endWaiting("message")}>Stop</button>;
     * ```
     */
    endWaiting(waiter: string): void;
  }

  export function useWait(): UseWaitAPI;
}

declare module '*.woff2' {
  const content: any;
  export default content;
}

declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const content: any;
  export default content;
}

declare module 'react-github-button' {
  import { Component } from 'react';

  export interface ReactGitHubButtonProps {
    /**
     * The type of information to display
     */
    type: 'stargazers' | 'watchers' | 'forks';
    /**
     * The size of the button. Leave undefined for default.
     */
    size?: 'large';
    /**
     * Your GitHub id or organization name.
     */
    namespace: string;
    /**
     * The name of your repository.
     */
    repo: string;
  }

  export default class GitHubButton extends Component<ReactGitHubButtonProps> {}
}
