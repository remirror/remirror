const PlaywrightEnvironment = require('jest-playwright-preset');

class CustomEnvironment extends PlaywrightEnvironment {
  constructor(config) {
    super(config);

    const jestCircus = {
      get currentTest() {
        return this.currentTest || { name: '' };
      },

      get currentTestName() {
        const { name, parent } = jestCircus.currentTest;

        if (!parent || !parent.name) {
          return name;
        }

        return `${parent.name} -- ${name}`;
      },
    };

    this.global.jestCircus = jestCircus;
  }

  handleTestEvent(event) {
    switch (event.name) {
      case 'test_start':
      case 'test_fn_failure':
      case 'test_done':
        this.currentTest = event.test;
        break;

      default:
        break;
    }
  }
}

module.exports = CustomEnvironment;
