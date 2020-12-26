import codeShift from 'jscodeshift';

// Eventually setup different function for each version in separate files.

const versions = {
  'next.50': null,
  'beta.1': null,
};

export function updateUseRemirror(): void {
  console.log(codeShift, versions);
}
