import enLocale from '../../en';

test('locales can be imported', () => {
  expect(enLocale.messages).toMatchInlineSnapshot(`
    Object {
      "user.mention.avatar.alt": Array [
        "Avatar for ",
        Array [
          "name",
        ],
      ],
    }
  `);
});
