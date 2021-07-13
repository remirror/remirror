declare module 'round' {
  namespace round {
    /**
     * Convenience method for rounding up.
     */
    function up(value: number, multiple?: number): number;

    /**
     * Convenience method for rounding down.
     */
    function down(value: number, multiple?: number): number;
  }

  /**
   * Round numbers to the nearest multiple with an optional direction.
   *
   * @param value - the value to round.
   * @param multiple - the multiple to round to - Default `1`
   * @param direction - `up` | `down`
   *
   * If no direction is supplied, the number will be rounded to the nearest
   * direction, defaulting to up if the value is equidistant from the rounded
   * values.
   */
  function round(value: number, multiple?: number, direction?: 'up' | 'down'): number;

  export = round;
}
