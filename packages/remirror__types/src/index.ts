export * from './types';

import type { Writable } from 'type-fest';

/** @deprecated Use built-in `Awaited` instead */
type PromiseValue<T> = Awaited<T>;

/** @deprecated Renamed to `Writable` */
type Mutable<BaseType, Keys extends keyof BaseType = keyof BaseType> = Writable<BaseType, Keys>;

export type { Mutable, PromiseValue };

export type {
  Asyncify,
  AsyncReturnType,
  CamelCase,
  Class,
  ConditionalExcept,
  ConditionalKeys,
  ConditionalPick,
  DelimiterCase,
  Entries,
  Entry,
  Except,
  FixedLengthArray,
  Get,
  IterableElement,
  JsonArray,
  JsonObject,
  JsonValue,
  KebabCase,
  LiteralUnion,
  Merge,
  MergeExclusive,
  ObservableLike,
  Opaque,
  PackageJson,
  PartialDeep,
  PascalCase,
  Primitive,
  Promisable,
  ReadonlyDeep,
  RequireAtLeastOne,
  RequireExactlyOne,
  SetOptional,
  SetRequired,
  SetReturnType,
  SnakeCase,
  Stringified,
  TsConfigJson,
  TypedArray,
  UnionToIntersection,
  ValueOf,
  Writable,
} from 'type-fest';
