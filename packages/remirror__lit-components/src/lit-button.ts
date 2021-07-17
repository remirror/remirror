import {
  css,
  CSSResult,
  customElement,
  html,
  LitElement,
  property,
  TemplateResult,
} from 'lit-element';

import { sharedStyles } from './shared-styles';

type ButtonType = 'primary' | 'secondary' | 'tertiary';

/**
 * @prop {String} label - Defines the text label.
 * @prop {String} icon - If set, replaces the text label with a custom icon.
 * @prop {String} color - Defines the button type. The possible values are
 * primary, secondary and tertiary
 * @prop {Boolean} disabled - If set to true, disables mouse clicks and the
 * style gets updated.
 *
 * @event 'click' - The click handler
 */
@customElement('remirror-button')
export class Button extends LitElement {
  static get styles(): CSSResult[] {
    return [
      sharedStyles,
      css`
        :host {
          font: var(--header-2);
          color: var(--text-1);
          display: flex;
          height: max-content;
          width: max-content;
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: var(--transition-1);
          justify-content: center;
          user-select: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        :host(:not([icon])) {
          min-width: 56px;
          max-width: 160px;
          padding: 4px 12px;
        }

        :host([color='tertiary']:not([icon])) {
          padding: 3px 11px;
        }

        :host([icon]) {
          padding: 4px;
        }

        :host([color='tertiary'][icon]) {
          padding: 3px;
        }

        /* idle */
        :host([color='primary']) {
          background-color: rgb(var(--rmr-primary-1));
        }
        :host([color='secondary']) {
          background-color: rgba(var(--rmr-secondary-1), 0.1);
        }
        :host([color='tertiary']) {
          border-width: 1px;
          border-style: solid;
          border-color: rgba(var(--rmr-tertiary-1), 0.25);
        }
        /* disabled */
        :host([disabled]) {
          pointer-events: none;
          opacity: 0.2;
        }
        /* text and icon colors */
        kor-icon {
          color: unset;
        }
        :host([color='primary']) {
          color: rgba(255, 255, 255, 0.9);
        }

        /* hover inputs */
        @media (hover: hover) {
          :host([color='primary']:not(:active):hover) {
            background-color: rgb(var(--accent-1b));
          }
          :host([color='secondary']:not(:active):hover) {
            background-color: rgba(var(--neutral-1), 0.15);
          }
          :host([color='tertiary']:not(:active):hover) {
            border-color: rgba(var(--neutral-1), 0.3);
            background-color: rgba(var(--neutral-1), 0.05);
          }
        }
      `,
    ];
  }

  /**
   * The text content to place inside the button.
   */
  @property({ type: String, reflect: true })
  label = '';

  @property({ type: String, reflect: true })
  icon?: string;

  @property({ type: String, reflect: true })
  color: ButtonType = 'primary';

  @property({ type: Boolean, reflect: true })
  disabled?: boolean;

  render(): TemplateResult {
    const child = this.icon
      ? html`<rmr-icon name="${this.icon}"></rmr-icon>`
      : html` ${this.label} `;

    return html`<button ?disabled="${this.disabled}" @click="${this.onClick}">${child}</button>`;
  }

  private onClick(event: MouseEvent) {
    this.dispatchEvent(event);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'remirror-button': Button;
  }
}
