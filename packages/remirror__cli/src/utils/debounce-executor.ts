import { logger } from '../logger';

const delay = 300;

export class DebounceExecutor {
  private readonly keys: Set<string>;
  private busy = false;

  constructor(private readonly fn: (key: string) => Promise<void>) {
    this.keys = new Set();
  }

  public push(key: string) {
    this.keys.add(key);
    this.execute();
  }

  private async execute() {
    if (this.busy) {
      return;
    }

    this.busy = true;

    while (this.keys.size > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));

      const key = this.popKey();

      if (key === null) {
        return;
      }

      try {
        await this.fn(key);
      } catch (error) {
        logger.error(error);
      }
    }

    this.busy = false;
  }

  private popKey() {
    const keys = [...this.keys];

    if (keys.length > 0) {
      const key = keys[0];
      this.keys.delete(key);
      return key;
    }

    return null;
  }
}
