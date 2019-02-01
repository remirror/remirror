import { add } from '../support/add';

describe('Example Typescript Test', () => {
  it('works', () => {
    // note TypeScript definition
    // const x: number = 42;
  });

  it('checks shape of an object', () => {
    const object = {
      age: 21,
      name: 'Joe',
    };
    expect(object).to.have.all.keys('name', 'age');
  });

  it('uses cy commands', () => {
    user.wrap({}).should('deep.eq', {});
  });

  it('tests our example site', () => {
    user.visit('https://example.cypress.io/');
    user
      .get('.home-list')
      .contains('Querying')
      .click();
    user.get('#query-btn').should('contain', 'Button');
  });

  // enable once we release updated TypeScript definitions
  it('has Cypress object type definition', () => {
    expect(Cypress.version).to.be.a('string');
  });

  // wrong code on purpose to type check our definitions
  // it('can visit website', () => {
  //   user.boo()
  // })

  it('adds numbers', () => {
    expect(add(2, 3)).to.equal(5);
  });

  it('uses custom command user.foo()', () => {
    user.foo().should('be.equal', 'foo');
  });
});
