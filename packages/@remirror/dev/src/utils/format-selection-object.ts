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
    if (subProps && subProps[prop]) {
      acc[prop] = subProps[prop].reduce((subAcc, subProp) => {
        subAcc[subProp] =
          !isNode.has(subProp) || !selection[prop][subProp]
            ? selection[prop][subProp]
            : selection[prop][subProp].toJSON();
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
