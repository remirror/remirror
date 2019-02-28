/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
export declare type LogMessage = string;
export declare interface LogEntry {
  message: LogMessage;
  origin: string;
  type: LogType;
}
export declare interface LogCounters {
  [label: string]: number;
}
export declare interface LogTimers {
  [label: string]: Date;
}
export declare type LogType =
  | 'assert'
  | 'count'
  | 'debug'
  | 'dir'
  | 'dirxml'
  | 'error'
  | 'group'
  | 'groupCollapsed'
  | 'info'
  | 'log'
  | 'time'
  | 'warn';
export declare type ConsoleBuffer = LogEntry[];
// # sourceMappingURL=Console.d.ts.map
