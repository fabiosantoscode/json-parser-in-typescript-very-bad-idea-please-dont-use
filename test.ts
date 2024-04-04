import { expectTypeOf } from 'expect-type'
import { ParseJson, ParserError } from './json-parser-in-typescript-very-bad-idea-please-dont-use'

const p = <T extends string>(_parsed: T): ParseJson<T> => ({} as any)

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

// garbage at the end
expectTypeOf(p('{}F')).toMatchTypeOf<ParserError<'Garbage at the end: "F"'>>()
expectTypeOf(p('1F')).toMatchTypeOf<ParserError<'Garbage at the end: "F"'>>()
expectTypeOf(p('1n')).toMatchTypeOf<ParserError<'Garbage at the end: "n"'>>()

// Strings
expectTypeOf(p('"a"')).toMatchTypeOf<"a">()
expectTypeOf(p('"ab"')).toMatchTypeOf<"ab">()
expectTypeOf(p('"abc"')).toMatchTypeOf<"abc">()
expectTypeOf(p('"a\\\\bc"')).toMatchTypeOf<"a\\bc">()
expectTypeOf(p('"a\\\\b\\\\c"')).toMatchTypeOf<"a\\b\\c">()
expectTypeOf(p('"a\\nbc"')).toMatchTypeOf<"a\nbc">()
expectTypeOf(p('"a\\rbc"')).toMatchTypeOf<"a\rbc">()
expectTypeOf(p('"a\\/bc"')).toMatchTypeOf<"a\/bc">()
expectTypeOf(p('"a\\\"bc"')).toMatchTypeOf<"a\"bc">()

expectTypeOf(p('"\\\\"')).toMatchTypeOf<"\\">()
expectTypeOf(p('"\\""')).toMatchTypeOf<'"'>()
expectTypeOf(p('""')).toMatchTypeOf<"">()

expectTypeOf(p('"\\"')).toMatchTypeOf<ParserError<string>>()
expectTypeOf(p('"\\')).toMatchTypeOf<ParserError<string>>()
expectTypeOf(p('"')).toMatchTypeOf<ParserError<string>>()
expectTypeOf(p('"ab')).toMatchTypeOf<ParserError<string>>()

// Errors for unimplemented features
expectTypeOf(p('"\\u"')).toMatchTypeOf<ParserError<"ParseJson does not support string unicode escapes (\\uXXXX)">>()
expectTypeOf(p('1e3')).toMatchTypeOf<ParserError<"ParseJson does not support exponential syntax for numbers (1e10)">>()
expectTypeOf(p('1.1E-3.5')).toMatchTypeOf<ParserError<"ParseJson does not support exponential syntax for numbers (1e10)">>()
