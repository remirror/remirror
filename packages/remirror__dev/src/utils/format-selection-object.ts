const copyProps = [
  'jsonID',
  'empty',
  'anchor',
  'from',
  'head',
  'to',
  '$anchor',
  '$head',
  '$cursor',
  '$to',
  '$from',
];

const copySubProps = {
  $from: ['nodeAfter', 'nodeBefore', 'parent', 'textOffset', 'depth', 'pos'],
  $to: ['nodeAfter', 'nodeBefore', 'parent', 'textOffset', 'depth', 'pos'],
};

const isNode = new Set(['nodeAfter', 'nodeBefore', 'parent']);

function filterProps(selection, props, subProps) {
  return props.reduce((acc, prop) => {
    if (subProps?.[prop]) {
      acc[prop] = subProps[prop].reduce((subAcc, subProps) => {
        subAcc[subProps] =
          !isNode.has(subProps) || !selection[prop][subProps]
            ? selection[prop][subProps]
            : selection[prop][subProps].toJSON();
        return subAcc;
      }, {});
    } else {
      acc[prop === 'jsonID' ? 'type' : prop] = selection[prop];
    }

    return acc;
  }, {});
}

export function expandedStateFormatSelection(selection) {
  return filterProps(selection, copyProps, copySubProps);
}

export function collapsedStateFormatSelection(selection) {
  return filterProps(selection, copyProps.slice(0, 6));
}
