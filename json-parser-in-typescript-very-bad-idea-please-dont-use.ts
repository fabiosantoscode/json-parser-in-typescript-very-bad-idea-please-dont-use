export type ParserError<T extends string> = { error: true } & T
type EatWhitespace<State extends string> =
  string extends State
    ? ParserError<"EatWhitespace got generic string type">
    : State extends `${' ' | '\n' | '\u000D' | '\u0009'}${infer State}`
      ? EatWhitespace<State>
      : State
type FlattenObj<O extends object> = {
  [K in keyof O]: O[K]
}
type AddKeyValue<Memo extends Record<string, any>, Key extends string, Value extends any> =
  FlattenObj<Memo & { [K in Key]: Value }>
type ParseJsonObject<State extends string, Memo extends Record<string, any> = {}> =
  string extends State
    ? ParserError<"ParseJsonObject got generic string type">
    : EatWhitespace<State> extends `}${infer State}`
      ? [Memo, State]
      : EatWhitespace<State> extends `"${infer Key}"${infer State}`
        ? EatWhitespace<State> extends `:${infer State}`
          ? ParseJsonValue<State> extends [infer Value, `${infer State}`]
            ? EatWhitespace<State> extends `,${infer State}`
              ? ParseJsonObject<State, AddKeyValue<Memo, Key, Value>>
              : EatWhitespace<State> extends `}${infer State}`
                ? [AddKeyValue<Memo, Key, Value>, State]
                : ParserError<`ParseJsonObject received unexpected token: ${State}`>
            : ParserError<`ParseJsonValue returned unexpected value for: ${State}`>
          : ParserError<`ParseJsonObject received unexpected token: ${State}`>
        : ParserError<`ParseJsonObject received unexpected token: ${State}`>
type ParseJsonArray<State extends string, Memo extends any[] = []> =
  string extends State
    ? ParserError<"ParseJsonArray got generic string type">
    : EatWhitespace<State> extends `]${infer State}`
      ? [Memo, State]
      : ParseJsonValue<State> extends [infer Value, `${infer State}`]
        ? EatWhitespace<State> extends `,${infer State}`
          ? ParseJsonArray<EatWhitespace<State>, [...Memo, Value]>
          : EatWhitespace<State> extends `]${infer State}`
            ? [[...Memo, Value], State]
            : ParserError<`ParseJsonArray received unexpected token: ${State}`>
        : ParserError<`ParseJsonValue returned unexpected value for: ${State}`>
type ParseJsonValue<State extends string> =
  string extends State
    ? ParserError<"ParseJsonValue got generic string type">
    : EatWhitespace<State> extends `null${infer State}`
      ? [null, State]
      : EatWhitespace<State> extends `true${infer State}`
        ? [true, State]
        : EatWhitespace<State> extends `false${infer State}`
          ? [false, State]
          : EatWhitespace<State> extends `${NumberCharacter}${string}`
            ? ParseNumber<State>
            : EatWhitespace<State> extends `"${infer State}`
              ? ParseString<State>
              : EatWhitespace<State> extends `[${infer State}`
                ? ParseJsonArray<State>
                : EatWhitespace<State> extends `{${infer State}`
                  ? ParseJsonObject<State>
                  : ParserError<`ParseJsonValue received unexpected token: ${State}`>

type ParseNumber<State extends string> =
  string extends State
    ? ParserError<"ParseNumber got generic string type">
    : ExtractNumber<State> extends [infer Num extends string, infer State]
      ? Num extends `${string}${"e" | "E"}${string}`
        ? ParserError<"ParseJson does not support exponential syntax for numbers (1e10)">
        : Num extends `${infer Num extends number}`
          ? [Num, State]
          : ParserError<`Could not parse the number ${Num}`>
        : ParserError<"Not a number">

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
type NumberCharacter = Digit | "-" | "." | "e" | "E"

type ExtractNumber<State extends string> =
  EatWhitespace<State> extends `${infer First extends NumberCharacter}${infer State}`
    ? ExtractNumber<State> extends [infer Rest extends string, infer State]
      ? [`${First}${Rest}`, State]
      : [`${First}`, State]
    : null // ends number

type ParseString<S extends string> =
  string extends S
    ? ParserError<"ParseString got generic string type">
    : S extends `"${infer Rest}`
      ? ['', Rest]
      : S extends `\\${infer C}${infer Rest}`
        ? ParseStringRest<ControlChar<C>, ParseString<Rest>>
        : S extends `${infer AChar}${infer Rest}`
          ? ParseStringRest<[AChar], ParseString<Rest>>
          : ParserError<'invalid string'>

type ControlChar<S extends string> =
  S extends `\\` ? [`\\`]
  : S extends `n` ? [`\n`]
  : S extends `r` ? [`\r`]
  : S extends `t` ? [`\t`]
  : S extends `f` ? [`\f`]
  : S extends `b` ? [`\b`]
  : S extends `/` ? [`\/`]
  : S extends `"` ? [`\"`]
  : S extends `u`
    ? ParserError<"ParseJson does not support string unicode escapes (\\uXXXX)">
    : ParserError<`invalid control char \\${S}`>

type ParseStringRest<C, Rest> =
  C extends [infer C extends string]
    ? Rest extends [infer Rest extends string, infer State]
      ? [`${C}${Rest}`, State]
      : Rest // parse error
    : C

export type ParseJson<T extends string> =
  ParseJsonValue<T> extends infer Result
    ? Result extends [infer Value, infer Rest extends string]
      ? EatWhitespace<Rest> extends ''
        ? Value
        : ParserError<`Garbage at the end: "${Rest}"`>
      : Result extends ParserError<any>
        ? Result
        : ParserError<"ParseJsonValue returned unexpected Result">
    : ParserError<"ParseJsonValue returned uninferrable Result">
