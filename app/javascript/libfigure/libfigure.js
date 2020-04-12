// repackage exports in a single file, so that LibFigure consumers
// don't have to worry about what specific file a variable is defined
// in.

import { defaultDialect } from "./util.js"
import { param, wristGrips } from "./param.js"
import { degreesToWords, anglesForMove } from "./move.js"
import { chooser, dancerMenuForChooser, dancerChooserNames } from "./chooser.js"
import {
  moves,
  moveTermsAndSubstitutionsForSelectMenu,
  formalParameters,
  parameterLabel,
  dancerMenuLabel,
} from "./define-figure.js"
import {} from "./figure.js" // for side effect!
import {} from "./after-figure.js" // for ... side effect?
import {} from "./dance.js" // ?? for side effect??

export default {
  defaultDialect,
  param,
  wristGrips,
  degreesToWords,
  anglesForMove,
  chooser,
  dancerMenuForChooser,
  dancerChooserNames,
  moves,
  moveTermsAndSubstitutionsForSelectMenu,
  formalParameters,
  parameterLabel,
  dancerMenuLabel,
}
