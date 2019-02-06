describe('Visiting documentation', () => {
  it('A user can type', () => {
    user
      .visit('http://localhost:3000/editors/basic')
      .get('[data-test-id=editor-instance]')
      .type('{selectall}')
      .type('{backspace}')
      .type('This is the beginning of world domination')
      .type('{selectall}')
      .type('{meta}b')
      .type('{downarrow}')
      .type('{enter}')
      .type('In a good way obviously')
      .type('{shift}{leftarrow}{leftarrow}');
  });
});
