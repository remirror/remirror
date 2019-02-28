/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Path } from './Config';
declare type Tester = (a: any, b: any) => boolean | undefined;
export declare type MatcherState = {
    assertionCalls: number;
    currentTestName?: string;
    dontThrow?: () => void;
    error?: Error;
    equals: (a: unknown, b: unknown, customTesters?: Array<Tester>, strictCheck?: boolean) => boolean;
    expand?: boolean;
    expectedAssertionsNumber?: number;
    isExpectingAssertions?: boolean;
    isNot: boolean;
    promise: string;
    suppressedErrors: Array<Error>;
    testPath?: Path;
    utils: {
        printExpected: (value: unknown) => string;
        printReceived: (value: unknown) => string;
        iterableEquality: Tester;
        subsetEquality: Tester;
    };
};
export {};
//# sourceMappingURL=Matchers.d.ts.map