import { logger } from '../logger';

const delay = 300;

export class DebounceExecutor {
  private timer: ReturnType<typeof setTimeout> | undefined;
  private readonly keys: Set<string>;
  private busy = false;

  constructor(private readonly fn: (key: string) => Promise<void>) {
    this.keys = new Set();
  }

  public push(key: string) {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.keys.add(key);
    this.timer = setTimeout(() => this.execute(), delay);
  }

  private async execute() {
    if (this.keys.size === 0 || this.busy) {
      return;
    }

    if (this.timer) {
      this.timer = undefined;
    }

    this.busy = true;
    const keys = [...this.keys];
    this.keys.clear();

    try {
      for (const key of keys) {
        await this.fn(key);
      }
    } catch (error) {
      logger.error(error);
    }

    this.busy = false;
    this.execute();
  }
}
