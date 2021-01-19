/**
 * The shape of the content which is placed within an SVG for creating the
 * generated icon.
 */
export interface IconTree {
  /**
   * The name of the tag to render.
   */
  tag: string;

  /**
   * The attributes (camel cased) to add to the rendered tag.
   */
  attr: { [key: string]: string };

  /**
   * The child tags to render.
   */
  child?: IconTree[];
}
