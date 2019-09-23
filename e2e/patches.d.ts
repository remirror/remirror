declare module 'jest-dev-server' {
  import { ChildProcess } from 'child_process';
  import { WaitOnOptions } from 'wait-on';

  export interface JestDevServerOptions {
    /**
     * Command to execute to start the port. Directly passed to spawnd.
     *
     * ```js
     * module.exports = {
     *   command: 'npm run start',
     * }
     * ```
     */
    command: string;

    /**
     * Log server output, useful if server is crashing at start.
     * @defaultValue `false`
     * ```js
     * module.exports = {
     *   command: 'npm run start',
     *   debug: true,
     * }
     * ```
     */
    debug?: boolean;

    /**
     * How many milliseconds to wait for the spawned server to be available before giving up. Defaults to wait-port's default.
     * @defaultValue 5000
     * ```js
     * module.exports = {
     *   command: 'npm run start',
     *   launchTimeout: 30000,
     * }
     * ```
     */
    launchTimeout?: number;

    /**
     * Host to wait for activity on before considering the server running. Must be used in conjunction with port.
     * @defaultValue 'localhost'
     *
     * ```js
     * module.exports = {
     *   command: 'npm run start --port 3000',
     *   host: 'customhost.com',
     *   port: 3000
     * }
     * ```
     */
    host?: string;

    /**
     * To wait for an HTTP or TCP endpoint before considering the server running, include http or tcp as a protocol. Must be used in conjunction with port.
     * @defaultValue 'tcp'
     * ```js
     * module.exports = {
     *   command: 'npm run start --port 3000',
     *   protocol: 'http',
     *   port: 3000,
     * }
     * ```
     */
    protocol?: 'https' | 'http' | 'tcp' | 'socket';

    /**
     * Port to wait for activity on before considering the server running. If not provided, the server is assumed to immediately be running.
     * @defaultValue null
     *
     * ```js
     * module.exports = {
     *   command: 'npm run start --port 3000',
     *   port: 3000,
     * }
     * ```
     */
    port?: number;

    /**
     * It defines the action to take if port is already used:
     * @defaultValue 'ask'
     *
     * - ask: a prompt is shown to decide if you want to kill the process or not
     * - error: an errow is thrown
     * - ignore: your test are executed, we assume that the server is already started
     * - kill: the process is automatically killed without a prompt
     *
     * ```js
     * module.exports = {
     *   command: 'npm run start --port 3000',
     *   port: 3000,
     *   usedPortAction: 'kill',
     * }
     */
    usedPortAction?: 'ask' | 'error' | 'ignore' | 'kill';

    /**
     * jest-dev-server uses the wait-on npm package to wait for resources to become available before calling callback.
     * @defaultValue `{}`
     *
     * ```js
     * module.exports = {
     *   command: 'npm run start --port 3000',
     *   port: 3000,
     *   usedPortAction: 'kill',
     *   waitOnScheme: {
     *     delay: 1000,
     *   },
     * }
     */
    waitOnScheme?: Partial<WaitOnOptions>;
  }

  export const ERROR_TIMEOUT: 'ERROR_TIMEOUT';
  export const ERROR_PORT_USED: 'ERROR_PORT_USED';
  export const ERROR_NO_COMMAND: 'ERROR_NO_COMMAND';

  export function setup(options: JestDevServerOptions | JestDevServerOptions[]): Promise<void>;
  export function teardown(): Promise<void>;
  export function getServers(): Promise<ChildProcess[]>;

  export class JestDevServerError extends Error {}
}

declare module 'signal-exit' {
  export interface Options {
    /**
     * Whether the listener should run after the exit.
     */
    alwaysLast?: boolean;
  }

  /**
   * The exit
   * @param code - the exitCode number or null if artifically induced
   * @param signal - the string signal which triggered the exit or null when artificially triggered
   */
  type ExitListener = (code: number | null, signal: string | null) => void;

  export interface SignalExit {
    (listener: ExitListener, options?: Options): void;
    load(): void;
    unload(): void;

    /**
     * A method which returns the possible signals for this platform
     *
     * @remarks
     * This is not the set of all possible signals.
     * It IS, however, the set of all signals that trigger
     * an exit on either Linux or BSD systems.  Linux is a
     * superset of the signal names supported on BSD, and
     * the unknown signals just fail to register, so we can
     * catch that easily enough.
     * Don't bother with SIGKILL.  It's uncatchable, which
     * means that we can't fire any callbacks anyway.
     * If a user does happen to register a handler on a non-
     * fatal signal like SIGWINCH or something, and then
     * exit, it'll end up firing `process.emit('exit')`, so
     * the handler will be fired anyway.
     * SIGBUS, SIGFPE, SIGSEGV and SIGILL, when not raised
     * artificially, inherently leave the process in a
     * state from which it is not safe to try and enter JS
     * listeners.
     */
    signals(): string[];
  }

  const signalExit: SignalExit;
  export default signalExit;
}
