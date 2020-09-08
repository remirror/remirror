export interface BaseFramework {
  /**
   * The name of the framework being used.
   */
  readonly name: string;

  /**
   * Destroy the framework and cleanup all created listeners.
   */
  destroy(): void;
}
