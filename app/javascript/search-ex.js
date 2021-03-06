import LibFigure from "libfigure/libfigure.js"

// search node class heirarchy goes here
export class SearchEx {
  // subtypes to implement:
  // toLisp()
  // static fromLispHelper(...)
  // static castFrom()
  // static minSubexpressions()
  // static maxSubexpressions()
  // static minUsefulSubexpressions()
  // 'src' constructor prop

  constructor({
    src,
    subexpressions = src ? [...src.subexpressions] : [],
  } = {}) {
    this.subexpressions = subexpressions
  }

  shallowCopy(props) {
    return new this.constructor({ ...props, src: this })
  }

  get op() {
    // Why use `this.constructor.name2` instead of just using `this.constructor.name`?
    // Because the minimizer used in production strips `this.constructor.name`, and it's faster
    // to just set name2 than to figure out how to turn off webpack or babel or whatever it is.
    return constructorNameToOp[this.constructor.name2]
  }

  static fromLisp(lisp) {
    const constructor = opToConstructor[lisp[0]]
    if (!constructor) {
      throw new Error(
        "lisp doesn't appear to start with an op: " + JSON.stringify(lisp)
      )
    } else if (!constructor.fromLispHelper) {
      throw new Error(
        "must go implement fromLispHelper for some superclass of '" +
          lisp[0] +
          "'"
      )
    } else {
      return constructor.fromLispHelper(constructor, lisp)
    }
  }

  castTo(op) {
    return opToConstructor[op].castFrom(this)
  }

  static default() {
    return defaultSearchEx
  }

  minSubexpressions() {
    return this.constructor.minSubexpressions()
  }

  maxSubexpressions() {
    return this.constructor.maxSubexpressions()
  }

  minUsefulSubexpressions() {
    return this.constructor.minUsefulSubexpressions()
  }

  copy() {
    // deeeep copy - am I even used?
    return SearchEx.fromLisp(this.toLisp())
  }

  static allProps() {
    // all properties held by any subclass.
    return allProps
  }

  isNumeric() {
    return false
  }

  replace(oldEx, newEx) {
    if (this === oldEx) return newEx
    else {
      for (let i = 0; i < this.subexpressions.length; i++) {
        const subexpressionOld = this.subexpressions[i]
        const subexpressionNew = subexpressionOld.replace(oldEx, newEx)
        if (subexpressionOld !== subexpressionNew) {
          const newChildren = [...this.subexpressions]
          newChildren[i] = subexpressionNew
          for (let j = i + 1; j < this.subexpressions.length; j++)
            newChildren[j] = this.subexpressions[j].replace(oldEx, newEx)
          return this.shallowCopy({ subexpressions: newChildren })
        }
      }
      return this
    }
  }

  remove(oldEx) {
    return removeHelper(this, oldEx, throwRemoveError)
  }

  withAdditionalSubexpression(e = SearchEx.default()) {
    if (this.subexpressions.length < this.maxSubexpressions())
      return this.shallowCopy({
        subexpressions: [...this.subexpressions, e],
      })
    else throw new Error("subexpressions are full")
  }

  static mutationNameForProp(propertyName) {
    if (propertyName.length >= 1) {
      return (
        "set" + propertyName.charAt(0).toUpperCase() + propertyName.slice(1)
      )
    } else {
      throw new Error("propertyName is too short")
    }
  }

  toString() {
    return `#<${this.constructor.name2} ${JSON.stringify(this.toLisp())}>`
  }

  toJson() {
    return JSON.stringify(this.toLisp())
  }

  static fromJson(string) {
    return SearchEx.fromLisp(JSON.parse(string))
  }
}

function registerSearchEx(className, ...props) {
  var op = className
  op = op.replace(/SearchEx$/, "")
  op = op.replace(/NumericEx$/, "")
  op = op.replace(/FigurewiseAnd/g, "&")
  op = op.replace(/CountMatches/, "count-matches")
  op = op.replace(/ProgressWith/, "progress-with")
  op = op.toLowerCase()
  constructorNameToOp[className] = op
  const constructor = eval(className)
  if (!constructor) {
    throw new Error("class name " + className + " not found")
  }
  opToConstructor[op] = constructor
  constructor.name2 = className
  for (let prop of props) {
    if (!allProps.includes(prop)) {
      allProps.push(prop)
    }
  }
}

const opToConstructor = {}
const constructorNameToOp = {}
const allProps = []

registerSearchEx("SearchEx", "subexpressions")

function errorMissingParameter(name) {
  throw new Error('missing parameter "' + name + '"')
}

const removeHelper = (root, target, rootHit) => {
  if (root === target) return rootHit()
  else {
    const sube = root.subexpressions.map(e =>
      removeHelper(e, target, constantlyNull)
    )
    let different = false
    for (let i = 0; i < sube.length; i++) {
      if (root.subexpressions[i] !== sube[i]) {
        different = true
        break
      }
    }
    if (different)
      return root.shallowCopy({ subexpressions: sube.filter(e => e) })
    else return root
  }
  return root
}

const throwRemoveError = () => {
  throw new Error("attempt to remove self is not allowed")
}

const constantlyNull = () => null

let nullaryMixin = Base =>
  class extends Base {
    static maxSubexpressions() {
      return 0
    }

    static minSubexpressions() {
      return 0
    }

    static minUsefulSubexpressions() {
      return 0
    }

    static castFrom(searchEx) {
      return new this()
    }
  }

let unaryMixin = Base =>
  class extends Base {
    static maxSubexpressions() {
      return 1
    }

    static minSubexpressions() {
      return 1
    }

    static minUsefulSubexpressions() {
      return 1
    }

    static castFrom(searchEx) {
      return new this(this.castConstructorDefaults(searchEx))
    }

    static castConstructorDefaults(searchEx) {
      return {
        subexpressions:
          1 === searchEx.subexpressions.length
            ? searchEx.subexpressions
            : [searchEx],
      }
    }
  }

let binaryishMixin = Base =>
  class extends Base {
    static maxSubexpressions() {
      return Infinity
    }

    static minSubexpressions() {
      return 0
    }

    static minUsefulSubexpressions() {
      return 2
    }

    static castFrom(searchEx) {
      if (
        0 === searchEx.minSubexpressions() &&
        searchEx.maxSubexpressions() > 0
      ) {
        return new this({ subexpressions: searchEx.subexpressions })
      } else {
        const ses = [searchEx]
        while (ses.length < this.minUsefulSubexpressions()) {
          ses.push(SearchEx.default())
        }
        return new this({ subexpressions: ses })
      }
    }
  }

export class FigureSearchEx extends nullaryMixin(SearchEx) {
  constructor(args) {
    super(args)
    const {
      src,
      move = src ? src.move : errorMissingParameter("move"),
      parameters = src && src.move === move ? [...src.parameters] : [],
      ellipsis = src ? src.ellipsis : parameters.length > 0,
    } = args
    const dealiasedMove = this.maybeDealiasMove(move, parameters)
    this._move = dealiasedMove
    this._ellipsis = ellipsis
    this._parameters = this.initialParameters(
      dealiasedMove,
      ellipsis,
      parameters
    )
  }

  // private & functional
  maybeDealiasMove(move, parameters) {
    const isAlias = move !== "*" && LibFigure.isAlias(move)
    if (isAlias) {
      const aliasFilter = LibFigure.aliasFilter(move)
      // if the parameters have a wider domain than the alias, dealias it
      for (let i = 0; i < parameters.length && i < aliasFilter.length; i++) {
        const parameter = parameters[i]
        const aliasF = aliasFilter[i]
        if (parameter != aliasF && aliasF != "*")
          return LibFigure.deAliasMove(move)
      }
    }
    return move
  }

  // private & functional
  initialParameters(move, ellipsis, parameters) {
    if (ellipsis && 0 === parameters.length && move !== "*") {
      const formals = LibFigure.formalParameters(move)
      const freshParameters = [...parameters]
      const isAlias = move !== "*" && LibFigure.isAlias(move)
      const aliasFilter = isAlias && LibFigure.aliasFilter(move)
      while (freshParameters.length < formals.length) {
        const isTextParameter =
          formals[freshParameters.length].ui.name == "chooser_text"
        let parameter
        if (isAlias) {
          parameter = aliasFilter[freshParameters.length]
        } else if (isTextParameter) {
          // Since they may want to search for the literal text '*',
          // we encode searching for any text as the empty string.
          parameter = ""
        } else {
          parameter = "*"
        }
        freshParameters.push(parameter)
      }
      return freshParameters
    } else return parameters
  }

  toLisp() {
    if (this.ellipsis) {
      return [this.op, this.move, ...this.parameters]
    } else {
      return [this.op, this.move]
    }
  }

  static fromLispHelper(constructor, lisp) {
    return new constructor({ move: lisp[1], parameters: lisp.slice(2) })
  }

  static castFrom(searchEx) {
    return new this({ move: "*" })
  }

  get move() {
    return this._move
  }

  get parameters() {
    return this._parameters
  }

  get ellipsis() {
    return this._ellipsis
  }
}
registerSearchEx("FigureSearchEx", "move", "parameters", "ellipsis")

class FormationSearchEx extends nullaryMixin(SearchEx) {
  constructor(args) {
    super(args)
    const { formation, src } = args
    this.formation =
      formation || src.formation || errorMissingParameter("formation")
  }

  toLisp() {
    return [this.op, this.formation]
  }

  static fromLispHelper(constructor, lisp) {
    return new constructor({ formation: lisp[1] })
  }

  static castFrom(searchEx) {
    return new this({ formation: "improper" })
  }
}
registerSearchEx("FormationSearchEx", "formation")

class SimpleUnarySearchEx extends unaryMixin(SearchEx) {
  toLisp() {
    return [this.op, this.subexpressions[0].toLisp()]
  }

  static fromLispHelper(constructor, lisp) {
    return new constructor({ subexpressions: [SearchEx.fromLisp(lisp[1])] })
  }
}

// expressions that take just other SearchEx's and no other things.
class SimpleBinaryishSearchEx extends binaryishMixin(SearchEx) {
  toLisp() {
    return [this.op, ...this.subexpressions.map(searchEx => searchEx.toLisp())]
  }

  static fromLispHelper(constructor, lisp) {
    return new constructor({
      subexpressions: lisp.slice(1).map(SearchEx.fromLisp),
    })
  }
}

class NoSearchEx extends SimpleUnarySearchEx {}
registerSearchEx("NoSearchEx")

class NotSearchEx extends SimpleUnarySearchEx {}
registerSearchEx("NotSearchEx")

class AllSearchEx extends SimpleUnarySearchEx {}
registerSearchEx("AllSearchEx")

class AndSearchEx extends SimpleBinaryishSearchEx {}
registerSearchEx("AndSearchEx")

class OrSearchEx extends SimpleBinaryishSearchEx {}
registerSearchEx("OrSearchEx")

class FigurewiseAndSearchEx extends SimpleBinaryishSearchEx {}
registerSearchEx("FigurewiseAndSearchEx")

class ThenSearchEx extends SimpleBinaryishSearchEx {}
registerSearchEx("ThenSearchEx")

const comparisons = ["=", "≠", ">", "<", "≥", "≤"]

export class CompareSearchEx extends SearchEx {
  constructor(args) {
    super(args)
    const { comparison, src } = args
    this.comparison =
      comparison || src.comparison || errorMissingParameter("comparison")
    if (this.subexpressions.length !== 2) {
      throw new Error(
        `new CompareSearchEx wants exactly 2 subexpressions, but got ${JSON.stringify(
          this.subexpressions
        )}`
      )
    }
  }

  get left() {
    return this.subexpressions[0]
  }

  get right() {
    return this.subexpressions[1]
  }

  comparisonOptions() {
    return comparisons
  }

  toLisp() {
    return [this.op, this.left.toLisp(), this.comparison, this.right.toLisp()]
  }

  static fromLispHelper(constructor, lisp) {
    const [_op, left, comparison, right] = lisp
    return new constructor({
      comparison: comparison,
      subexpressions: [SearchEx.fromLisp(left), SearchEx.fromLisp(right)],
    })
  }

  static castFrom(searchEx) {
    return new this({
      comparison: searchEx.comparison || comparisons[0],
      subexpressions: [
        new ConstantNumericEx({ number: 0 }),
        new ConstantNumericEx({ number: 0 }),
      ],
    })
  }

  static minSubexpressions() {
    return 2
  }

  static maxSubexpressions() {
    return 2
  }

  static minUsefulSubexpressions() {
    return 2
  }
}
registerSearchEx("CompareSearchEx", "comparison")

export class NumericEx extends SearchEx {
  isNumeric() {
    return true
  }
}

export class ConstantNumericEx extends NumericEx {
  constructor(args) {
    super(args)
    const { number, src } = args
    if (number || 0 === number) {
      this.number = number
    } else if (src && (src.number || 0 === src.number)) {
      this.number = src.number
    } else {
      errorMissingParameter("number")
    }
  }

  static fromLispHelper(constructor, lisp) {
    return new constructor({ number: lisp[1] })
  }

  toLisp() {
    return [this.op, this.number]
  }

  static castFrom(searchEx) {
    return new this({ number: 0 })
  }

  static minSubexpressions() {
    return 0
  }

  static maxSubexpressions() {
    return 0
  }

  static minUsefulSubexpressions() {
    return 0
  }
}
registerSearchEx("ConstantNumericEx", "number")

class TagNumericEx extends NumericEx {
  constructor(args) {
    super(args)
    const { tag, src } = args
    this.tag = tag || src.tag || errorMissingParameter("tag")
  }

  static fromLispHelper(constructor, lisp) {
    return new constructor({ tag: lisp[1] })
  }

  toLisp() {
    return [this.op, this.tag]
  }

  static castFrom(searchEx) {
    return new this({ tag: "verified" })
  }

  static minSubexpressions() {
    return 0
  }

  static maxSubexpressions() {
    return 0
  }

  static minUsefulSubexpressions() {
    return 0
  }
}
registerSearchEx("TagNumericEx", "tag")

class CountMatchesNumericEx extends unaryMixin(NumericEx) {
  static fromLispHelper(constructor, lisp) {
    return new constructor({ subexpressions: [SearchEx.fromLisp(lisp[1])] })
  }

  toLisp() {
    return [this.op, this.subexpressions[0].toLisp()]
  }

  static castFrom(searchEx) {
    return new this({ subexpressions: [SearchEx.default()] })
  }
}
registerSearchEx("CountMatchesNumericEx")

class ProgressWithSearchEx extends SimpleUnarySearchEx {}
registerSearchEx("ProgressWithSearchEx")

const defaultSearchEx = SearchEx.fromLisp(["figure", "*"])
