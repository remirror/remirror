import { debounce } from '@remirror/core-helpers';

// Code taken from https://github.com/downshift-js/downshift/blob/master/src/set-a11y-status.js#L1

let statusDiv: HTMLDivElement | undefined;

/**
 * Get the status node or create it if it does not already exist.
 *
 * @param doc - document passed by the user.
 * @return the singleton status node.
 */
const getStatusDiv = (doc = document) => {
  if (statusDiv) {
    return statusDiv;
  }

  statusDiv = doc.createElement('div');
  statusDiv.setAttribute('id', 'a11y-status-message');
  statusDiv.setAttribute('role', 'status');
  statusDiv.setAttribute('aria-live', 'polite');
  statusDiv.setAttribute('aria-relevant', 'additions text');
  Object.assign(statusDiv.style, {
    border: '0',
    clip: 'rect(0 0 0 0)',
    height: '1px',
    margin: '-1px',
    overflow: 'hidden',
    padding: '0',
    position: 'absolute',
    width: '1px',
  });

  doc.body.appendChild(statusDiv);
  return statusDiv;
};

/**
 * Remove the current live status when no changes occur within a 500ms period.
 */
const cleanupStatus = debounce(500, () => {
  getStatusDiv().textContent = '';
});

/**
 * Set the status of the created live region status so that screen readers
 * announce the changes for a11y.
 *
 * @remarks
 *
 * The status is using a singleton html div. This means that the same invisible
 * live status element is used for the lifetime of the app.
 *
 * @param status the status message
 * @param doc document passed by the user.
 */
export const setStatus = (status: string, doc?: Document) => {
  const div = getStatusDiv(doc);
  if (!status) {
    return;
  }

  div.textContent = status;
  cleanupStatus();
};

export default setStatus;
