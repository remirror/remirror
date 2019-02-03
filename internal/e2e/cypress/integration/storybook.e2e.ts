describe('Visiting storybook', () => {
  it('A user can type', () => {
    user
      .visit('http://localhost:6006/iframe.html?selectedKind=Editor&selectedStory=Basic')
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
