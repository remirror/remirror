declare namespace jasmine {
  interface CustomReportExpectation {
    matcherName: string;
    message: string;
    passed: boolean;
    stack: string;
  }

  interface FailedExpectation extends CustomReportExpectation {
    actual: string;
    expected: string;
  }

  interface PassedExpectation extends CustomReportExpectation {}

  interface CustomReporterResult {
    description: string;
    failedExpectations?: FailedExpectation[];
    fullName: string;
    id: string;
    passedExpectations?: PassedExpectation[];
    pendingReason?: string;
    status?: string;
  }

  interface CustomReporter {
    suiteStarted?(result: CustomReporterResult): void;
    specStarted?(result: CustomReporterResult): void;
    specDone?(result: CustomReporterResult): void;
    suiteDone?(result: CustomReporterResult): void;
  }

  interface Env {
    version(): any;
    versionString(): string;
    nextSpecId(): number;
    addReporter(reporter: CustomReporter): void;
    execute(): void;
  }
  function getEnv(): Env;
  let currentTest: CustomReporterResult;
}

jasmine.getEnv().addReporter({
  specStarted: result => {
    jasmine.currentTest = result;
  },
  specDone: result => {
    jasmine.currentTest = result;
  },
});
