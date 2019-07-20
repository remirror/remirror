import { ALL_EXTENSIONS, ALL_GENERIC_EXTENSIONS, ALL_MARK_EXTENSIONS, ALL_NODE_EXTENSIONS } from '../all';

describe('extensions exports', () => {
  it('has correctly exported _generic_ extensions', () => {
    expect(ALL_GENERIC_EXTENSIONS).toHaveLength(6);
  });

  it('has correctly exported _mark_ extensions', () => {
    expect(ALL_MARK_EXTENSIONS).toHaveLength(6);
  });

  it('has correctly exported _node_ extensions', () => {
    expect(ALL_NODE_EXTENSIONS).toHaveLength(9);
  });

  it('has correctly exported _all_ extensions', () => {
    expect(ALL_EXTENSIONS).toHaveLength(21);
  });
});
