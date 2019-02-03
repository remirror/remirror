// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// add a custom command cy.foo()
Cypress.Commands.add('foo', () => 'foo');

// see more example of adding custom commands to Cypress TS interface
// in https://github.com/cypress-io/add-cypress-custom-command-in-typescript
// add new command to the existing Cypress interface
// tslint:disable-next-line no-namespace
declare namespace Cypress {
  // tslint:disable-next-line interface-name
  interface Chainable {
    foo: () => string;
  }
}

// Sets up the ability to read coverage reports from storybook runs.

if (Cypress.env('coverage')) {
  afterEach(() => {
    const coverageFile = `${(Cypress.config() as any).coverageFolder}/out.json`;

    cy.window().then(win => {
      const coverage = (win as any).__coverage__; // Coverage is injected by nyc into the global scope

      if (!coverage) {
        return;
      }

      cy.task('coverage', coverage).then(map => {
        cy.writeFile(coverageFile, map as any);
        console.log(Cypress.env(), coverageFile);

        if (Cypress.env('coverage') === 'open') {
          cy.exec('nyc report');
        }
      });
    });
  });
}
