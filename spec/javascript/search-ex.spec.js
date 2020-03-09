// run with `yarn test`
import { SearchEx, FigureSearchEx } from "search-ex"

describe("x = toLisp of fromLisp of x", () => {
  ;[
    ["figure", "do si do"],
    ["figure", "swing", "partners", "*", 8],
    ["formation", "improper"],
    ["progression"],
    ["or", ["figure", "do si do"], ["figure", "swing"]],
    ["and", ["figure", "do si do"], ["figure", "swing"]],
    ["&", ["progression"], ["figure", "star"]],
    ["then", ["figure", "do si do"], ["figure", "swing"]],
    ["no", ["progression"]],
    ["not", ["figure", "do si do"]],
    ["all", ["figure", "do si do"]],
    ["count", ["progression"], ">", 0],
    ["compare", ["constant", 4], "<", ["constant", 6]],
    ["constant", 5],
    ["constant", 0],
    ["tag", "verified"],
    ["count-matches", ["figure", "*"]],
  ].forEach(function(lisp) {
    test(JSON.stringify(lisp), () =>
      expect(SearchEx.fromLisp(lisp).toLisp()).toEqual(lisp)
    )
  })
})

describe("cast", () => {
  ;[
    {
      op: "then",
      from: ["progression"],
      want: ["then", ["progression"], ["figure", "*"]],
    },
    {
      op: "then",
      from: ["not", ["progression"]],
      want: ["then", ["not", ["progression"]], ["figure", "*"]],
    },
    { op: "then", from: ["and"], want: ["then"] },
    {
      op: "then",
      from: ["and", ["progression"]],
      want: ["then", ["progression"]],
    },
    {
      op: "then",
      from: ["and", ["progression"], ["figure", "chain"]],
      want: ["then", ["progression"], ["figure", "chain"]],
    },
    {
      op: "and",
      from: ["figure", "swing"],
      want: ["and", ["figure", "swing"], ["figure", "*"]],
    },
    { op: "figure", from: ["and"], want: ["figure", "*"] },
    { op: "formation", from: ["and"], want: ["formation", "improper"] },
    { op: "progression", from: ["and"], want: ["progression"] },
    { op: "no", from: ["and"], want: ["no", ["and"]] },
    { op: "no", from: ["not", ["figure", "*"]], want: ["no", ["figure", "*"]] },
    {
      op: "no",
      from: ["or", ["figure", "swing"], ["figure", "chain"]],
      want: ["no", ["or", ["figure", "swing"], ["figure", "chain"]]],
    },
    { op: "not", from: ["and"], want: ["not", ["and"]] },
    {
      op: "not",
      from: ["no", ["figure", "*"]],
      want: ["not", ["figure", "*"]],
    },
    {
      op: "not",
      from: ["or", ["figure", "swing"], ["figure", "chain"]],
      want: ["not", ["or", ["figure", "swing"], ["figure", "chain"]]],
    },
    { op: "all", from: ["and"], want: ["all", ["and"]] },
    {
      op: "all",
      from: ["no", ["figure", "*"]],
      want: ["all", ["figure", "*"]],
    },
    {
      op: "all",
      from: ["or", ["figure", "swing"], ["figure", "chain"]],
      want: ["all", ["or", ["figure", "swing"], ["figure", "chain"]]],
    },
    { op: "count", from: ["and"], want: ["count", ["and"], ">", 0] },
    {
      op: "count",
      from: ["no", ["figure", "*"]],
      want: ["count", ["figure", "*"], ">", 0],
    },
    {
      op: "count",
      from: ["or", ["figure", "swing"], ["figure", "chain"]],
      want: ["count", ["or", ["figure", "swing"], ["figure", "chain"]], ">", 0],
    },
    {
      op: "compare",
      from: ["progression"],
      want: ["compare", ["constant", 0], ">", ["constant", 0]],
    },
    { op: "constant", from: ["tag", "verified"], want: ["constant", 0] },
    { op: "tag", from: ["constant", 7], want: ["tag", "verified"] },
    {
      op: "count-matches",
      from: ["constant", 7],
      want: ["count-matches", ["figure", "*"]],
    },
    {
      op: "progress with",
      from: ["not", ["figure", "star"]],
      want: ["progress with", ["figure", "star"]],
    },
  ].forEach(function({ from, op, want }, i) {
    const fromEx = SearchEx.fromLisp(from)
    const got = fromEx.castTo(op).toLisp()
    test(`${fromEx}.castTo('${op}') ≈> ${JSON.stringify(want)}`, () => {
      expect(got).toEqual(want)
    })
  })
})

describe("ellipsis", () => {
  test("with parameters specified", () => {
    const searchEx = new FigureSearchEx({
      move: "swing",
      parameters: ["*", "*", 8],
    })
    const bigLisp = ["figure", "swing", "*", "*", 8]
    const shortLisp = ["figure", "swing"]
    expect(searchEx.toLisp()).toEqual(bigLisp)
    expect(searchEx.ellipsis).toEqual(true)
    searchEx.ellipsis = false
    expect(searchEx.ellipsis).toEqual(false)
    expect(searchEx.toLisp()).toEqual(shortLisp)
    searchEx.ellipsis = true
    expect(searchEx.ellipsis).toEqual(true)
    expect(searchEx.toLisp()).toEqual(bigLisp)
  })

  test("without parameters left off", () => {
    const searchEx = new FigureSearchEx({ move: "swing" })
    const bigLisp = ["figure", "swing", "*", "*", "*"]
    const shortLisp = ["figure", "swing"]
    expect(searchEx.ellipsis).toEqual(false)
    expect(searchEx.toLisp()).toEqual(shortLisp)
    searchEx.ellipsis = true
    expect(searchEx.ellipsis).toEqual(true)
    expect(searchEx.toLisp()).toEqual(bigLisp)
    searchEx.ellipsis = false
    expect(searchEx.ellipsis).toEqual(false)
    expect(searchEx.toLisp()).toEqual(shortLisp)
  })
})

test("copy", () => {
  const originalLisp = ["and", ["figure", "do si do"], ["figure", "swing"]]
  const original = SearchEx.fromLisp(originalLisp)
  const copy = original.copy()
  copy.subexpressions[0].move = "circle"
  expect(copy.toLisp()).toEqual([
    "and",
    ["figure", "circle"],
    ["figure", "swing"],
  ])
  expect(original.toLisp()).toEqual(originalLisp)
  expect(originalLisp[1][1]).toEqual("do si do")
})

describe("isNumeric()", () => {
  ;[
    ["figure", "do si do"],
    ["figure", "swing", "partners", "*", 8],
    ["formation", "improper"],
    ["progression"],
    ["or", ["figure", "do si do"], ["figure", "swing"]],
    ["and", ["figure", "do si do"], ["figure", "swing"]],
    ["&", ["progression"], ["figure", "star"]],
    ["then", ["figure", "do si do"], ["figure", "swing"]],
    ["no", ["progression"]],
    ["not", ["figure", "do si do"]],
    ["all", ["figure", "do si do"]],
    ["count", ["progression"], ">", 0],
    ["compare", ["constant", 4], "<", ["constant", 6]],
    ["progress with", ["figure", "do si do"]],
  ].forEach(lisp => {
    test(JSON.stringify(lisp) + " → false", () =>
      expect(SearchEx.fromLisp(lisp).isNumeric()).toBe(false)
    )
  })
  ;[
    ["constant", 5],
    ["constant", 0],
    ["tag", "verified"],
    ["count-matches", ["figure", "*"]],
  ].forEach(lisp => {
    test(JSON.stringify(lisp) + " → true", () =>
      expect(SearchEx.fromLisp(lisp).isNumeric()).toBe(true)
    )
  })
})

describe("replace()", () => {
  it("depth 0 hit", () => {
    const oldRoot = SearchEx.fromLisp(["figure", "*"])
    const oldSub = oldRoot
    const newSub = SearchEx.fromLisp(["figure", "do si do"])
    const newRoot = oldRoot.replace(oldSub, newSub)
    expect(newRoot).toBe(newSub)
  })

  it("depth 0 miss", () => {
    const oldRoot = SearchEx.fromLisp(["figure", "*"])
    const oldSub = SearchEx.fromLisp(["figure", "swing"])
    const newSub = SearchEx.fromLisp(["figure", "do si do"])
    const newRoot = oldRoot.replace(oldSub, newSub)
    expect(newRoot).toBe(oldRoot)
  })

  it("depth 1 miss", () => {
    const oldRoot = SearchEx.fromLisp([
      "&",
      ["figure", "star"],
      ["progression"],
    ])
    const oldSub = oldRoot.subexpressions[0] // star
    const newSub = SearchEx.fromLisp(["figure", "do si do"])
    const newRoot = oldRoot.replace(oldSub, newSub)
    const expectedLisp = ["&", ["figure", "do si do"], ["progression"]]
    expect(newRoot.toLisp()).toEqual(expectedLisp)
    expect(newRoot.subexpressions[1]).toBe(oldRoot.subexpressions[1])
    expect(newRoot.op).toEqual("&")
    expect(newRoot.subexpressions[0].op).toEqual("do si do")
  })
})

fdescribe("shallow copy", () => {
  it("'and'", () => {
    const oldEx = SearchEx.fromLisp(["and", ["progression"]])
    const newEx = oldEx.shallowCopy({
      subexpressions: [SearchEx.fromLisp(["figure", "*"])],
    })
    expect(oldEx).not.toBe(newEx)
    expect(newEx.subexpressions).not.toBe(oldEx.subexpressions)
    expect(newEx.subexpressions).toEqual([SearchEx.fromLisp(["figure", "*"])])
  })

  describe("'figure'", () => {
    it("move", () => {
      const oldEx = SearchEx.fromLisp([
        "figure",
        "do si do",
        "ladles",
        true,
        540,
        8,
      ])
      const newEx = oldEx.shallowCopy({ move: "allemande" })
      expect(newEx.subexpressions).not.toBe(oldEx.subExpressions)
      expect(newEx.move).toEqual("allemande")
      expect(newEx.parameters).not.toBe(oldEx.parameters)
      expect(newEx.parameters).toEqual(["ladles", true, 540, 8])
    })
    it("parameters", () => {
      const oldEx = SearchEx.fromLisp([
        "figure",
        "do si do",
        "ladles",
        true,
        540,
        8,
      ])
      const newEx = oldEx.shallowCopy({
        parameters: ["gentlespoons", true, "*", 8],
      })
      expect(newEx.subexpressions).not.toBe(oldEx.subExpressions)
      expect(newEx.move).toBe(oldEx.move)
      expect(newEx.parameters).not.toBe(oldEx.parameters)
      expect(newEx.parameters).toEqual(["gentlespoons", true, "*", 8])
    })
  })
})
