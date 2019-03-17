import { FromTo } from '@remirror/core';

export class SuggestionState {
  public active: boolean = false;
  public range: FromTo | null = null;
  public query: string | null = null;
  public text: string | null = null;

  public resetState() {
    this.active = false;
    this.range = null;
    this.query = null;
    this.text = null;
  }

  public toJSON() {
    return {
      active: this.active,
      range: this.range,
      query: this.query,
      text: this.text,
    };
  }
}
