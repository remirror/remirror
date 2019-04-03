declare module 'object.omit' {
  type Omit<GType, GKeys extends keyof GType> = Pick<GType, Exclude<keyof GType, GKeys>>;

  /**
   * Return a copy of an object excluding the given key, or array of keys. Also accepts an optional filter function as the last argument."
   *
   * ```ts
   * omit({a: 'a', b: 'b', c: 'c'}, ['a', 'c'])
   * //=> { b: 'b' }
   * ```
   *
   * @param object
   * @param keys
   */
  function omit<GObject extends object, GKey extends keyof GObject>(
    object: GObject,
    keys: GKey[],
  ): Omit<GObject, GKey>;

  function omit<GObject extends object, GKey extends keyof GObject>(
    object: GObject,
    key: GKey,
  ): Omit<GObject, GKey>;

  function omit<GObject extends object, GKey extends keyof GObject>(
    object: GObject,
    fn: (value: GObject[GKey], key: GKey, obj: GObject) => boolean,
  ): { [key: string]: any };

  export = omit;
}

declare module 'object.pick' {
  /**
   * Returns a filtered copy of an object with only the specified keys, similar to `_.pick` from lodash / underscore.
   *
   * @param object
   * @param keys
   */
  function pick<T extends object, U extends keyof T>(object: T, keys: U[]): Pick<T, U>;

  export = pick;
}
