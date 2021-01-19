// Side effects
import './es-module-shims';

declare global {
  namespace importShim {
    /**
     * #### Skip Processing
     *
     * > Stability: Non-spec feature
     *
     * When loading modules that you know will only use baseline modules
     * features, it is possible to set a rule to explicitly opt-out modules
     * from rewriting. This improves performance because those modules then do
     * not need to be processed or transformed at all, so that only local
     * application code is handled and not library code.
     *
     * This can be configured by setting the importShim.skip URL regular
     * expression:
     *
     * ```js
     * importShim.skip = /^https:\/\/cdn\.com/;
     * ```
     *
     * By default, this expression supports jspm.dev, dev.jspm.io and
     * cdn.pika.dev.
     */
    let skip: RegExp;

    /**
     * #### Skip URL Cache Registry
     *
     * > Stability: Non-spec feature
     *
     * When loading a url you may always want to run a custom `importShim.fetch`
     * pre-processor. By default all URL's are cached within an internal registry
     * after the first load. Every subsequent request to the URL will be resolved
     * from the cache. In order to disable caching for a url, you can add your own
     * custom regex, or a function that takes the `url` as the first parameter and
     * returns `true` to skip the registry.
     *
     * ```js
     * importShim.skipRegistry = /^\/__internal-modules\/.*$/
     * ```
     *
     * @default () => false
     */
    let skipRegistry: ((url: string) => boolean) | RegExp;

    /**
     * #### Fetch Hook
     *
     * > Stability: Non-spec feature
     *
     * This is provided as a convenience feature since the pipeline handles
     * the same data URL rewriting and circular handling of the module graph
     * that applies when trying to implement any module transform system.
     *
     * The ES Module Shims fetch hook can be used to implement transform
     * plugins.
     *
     * For example:
     *
     * ```js
     * importShim.fetch = async function (url) {
     *   const response = await fetch(url);
     *   if (response.url.endsWith('.ts')) {
     *     const source = await response.body();
     *     const transformed = tsCompile(source);
     *     return new Response(new Blob([transformed], { type: 'application/javascript' }));
     *   }
     *   return response;
     * };
     * ```
     *
     * Because the dependency analysis applies by ES Module Shims takes care
     * of ensuring all dependencies run through the same fetch hook, the above
     * is all that is needed to implement custom plugins.
     *
     * Streaming support is also provided, for example here is a hook with
     * streaming support for JSON:
     *
     * ```js
     * importShim.fetch = async function (url) {
     *   const response = await fetch(url);
     *   if (!response.ok)
     *     throw new Error(`${response.status} ${response.statusText} ${response.url}`);
     *   const contentType = response.headers.get('content-type');
     *   if (!/^application\/json($|;)/.test(contentType))
     *     return response;
     *   const reader = response.body.getReader();
     *   return new Response(new ReadableStream({
     *     async start (controller) {
     *       let done, value;
     *       controller.enqueue(new Uint8Array([...'export default '].map(c => c.charCodeAt(0))));
     *       while (({ done, value } = await reader.read()) && !done) {
     *         controller.enqueue(value);
     *       }
     *       controller.close();
     *     }
     *   }), {
     *     status: 200,
     *     headers: {
     *       "Content-Type": "application/javascript"
     *     }
     *   });
     * }
     * ```
     */
    function fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;

    /**
     * #### Dynamic Import Map Updates
     *
     * Import maps are frozen as soon as the first module load is loaded.
     *
     * To support dynamic injection of new import maps into the page, call
     * importShim.load() to pick up any new `<script type="importmap-shim">`
     * tags.
     *
     * This can be linked up to mutation observers if desired, with something
     * like:
     *
     * ```js
     * new MutationObserver(mutations => {
     *   for (const mutation of mutations) {
     *     if (mutation.type !== 'childList') continue;
     *
     *     for (const node of mutation.addedNodes) {
     *       if (node.tagName === 'SCRIPT' && node.type === 'importmap-shim' && !node.ep) {
     *         importShim.load();
     *         break;
     *       }
     *     }
     *   }
     * }).observe(document, { childList: true, subtree: true });
     * ```
     *
     * then allowing dynamic injection of `<script type="importmap-shim">` to
     * immediately update the internal import maps.
     */
    function load(): void;

    /**
     * Handle errors.
     */
    let onerror: (error: any) => void;

    /**
     * @internal
     */
    let e: any;

    /**
     * @internal
     */
    let l: any;
  }

  /**
   * Dynamic import(...) within any modules loaded will be rewritten as
   * importShim(...) automatically providing full support for all es-module-shims
   * features through dynamic import.
   *
   * To load code dynamically (say from the browser console), importShim can be
   * called similarly:
   *
   * ```js
   * importShim('/path/to/module.js').then(x => console.log(x));
   * ```
   */
  function importShim<Default, Exports extends object>(
    path: string,
    parentUrl?: string,
  ): Promise<{ default: Default } & Exports>;

  interface Window {
    importShim: typeof importShim;
  }

  interface Global {
    importShim: typeof importShim;
  }
}
