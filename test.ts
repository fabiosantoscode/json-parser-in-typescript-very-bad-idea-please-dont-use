import { expectTypeOf } from 'expect-type'
import { ParseJson } from './json-parser-in-typescript-very-bad-idea-please-dont-use'

const p = <T extends string>(parsed: T): ParseJson<T> => ({} as any)

expectTypeOf(p('{"a": "3"}')).toMatchTypeOf<{a: "3"}>()
expectTypeOf(p('{"a": []}')).toMatchTypeOf<{a: []}>()
expectTypeOf(p('{"a": {"b": "c"}}')).toMatchTypeOf<{a: {b: "c"}}>()

// whitespace
expectTypeOf(p('true')).toMatchTypeOf<true>()
expectTypeOf(p('true\u0020')).toMatchTypeOf<true>()
expectTypeOf(p('\u0020true')).toMatchTypeOf<true>()
expectTypeOf(p('true\u000A')).toMatchTypeOf<true>()
expectTypeOf(p('\u000Atrue')).toMatchTypeOf<true>()
expectTypeOf(p('true\u000D')).toMatchTypeOf<true>()
expectTypeOf(p('\u000Dtrue')).toMatchTypeOf<true>()
expectTypeOf(p('true\u0009')).toMatchTypeOf<true>()
expectTypeOf(p('\u0009true')).toMatchTypeOf<true>()

// numbers
expectTypeOf(p('1')).toMatchTypeOf<1>()
expectTypeOf(p('0.1')).toMatchTypeOf<0.1>()
expectTypeOf(p('.1')).toMatchTypeOf<number>()
expectTypeOf(p('-1')).toMatchTypeOf<-1>()
expectTypeOf(p('1e2')).toMatchTypeOf<number>()
expectTypeOf(p('1e-1')).toMatchTypeOf<number>()
