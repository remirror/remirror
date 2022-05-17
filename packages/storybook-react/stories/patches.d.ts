declare module 'diffable-html' {
  /**
   * This formatter will normalize your HTML in a way that when you diff it, you
   * get a clear sense of what changed.
   *
   * This is a "zero-config" and opinionated HTML formatter. Default rules might
   * change in future releases in which case we will push a major release.
   *
   * Feel free to open issues to discuss better defaults.
   *
   * ```ts
   * import toDiffableHtml from 'diffable-html';
   *
   * const html = `
   * <div id="header">
   * <h1>Hello World!</h1>
   * <ul id="main-list" class="list"><li><a href="#">My HTML</a></li></ul>
   * </div>
   * `
   *
   * log(toDiffableHtml(html));
   * ```
   *
   */
  function toDiffableHtml(html: string): string;
  export = toDiffableHtml;
}
