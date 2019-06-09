// run with `yarn test`
import { SearchEx, FigureSearchEx } from 'search_ex.js';

function lispEquals(lisp1, lisp2) {
  return JSON.stringify(lisp1) === JSON.stringify(lisp2);
}

describe('x = toLisp of fromLisp of x', () => {
  [['figure', 'do si do'],
   ['figure', 'swing', 'partners', '*', 8],
   ['formation', 'improper'],
   ['progression'],
   ['or', ['figure', 'do si do'], ['figure', 'swing']],
   ['and', ['figure', 'do si do'], ['figure', 'swing']],
   ['&', ['progression'], ['figure', 'star']],
   ['then', ['figure', 'do si do'], ['figure', 'swing']],
   ['no', ['progression']],
   ['not', ['figure', 'do si do']],
   ['all', ['figure', 'do si do']],
   ['count', ['progression'], '>', 0]
  ].forEach(function(lisp, i) {
    test(JSON.stringify(lisp), () =>
         expect(lispEquals(lisp, SearchEx.fromLisp(lisp).toLisp())).toEqual(true)
        );
  });
});

describe('cast', () => {
  [{op: 'then', from: ['progression'], want: ['then', ['progression'], ['figure', '*']]},
   {op: 'then', from: ['not', ['progression']], want: ['then', ['not', ['progression']], ['figure', '*']]},
   {op: 'then', from: ['and'], want: ['then']},
   {op: 'then', from: ['and', ['progression']], want: ['then', ['progression']]},
   {op: 'then', from: ['and', ['progression'], ['figure', 'chain']], want: ['then', ['progression'], ['figure', 'chain']]},
   {op: 'and', from: ['figure', 'swing'], want: ['and', ['figure', 'swing'], ['figure', '*']]},
   {op: 'figure', from: ['and'], want: ['figure', '*']},
   {op: 'formation', from: ['and'], want: ['formation', 'improper']},
   {op: 'progression', from: ['and'], want: ['progression']},
   {op: 'no', from: ['and'], want: ['no', ['and']]},
   {op: 'no', from: ['not', ['figure', '*']], want: ['no', ['figure', '*']]},
   {op: 'no', from: ['or', ['figure', 'swing'], ['figure', 'chain']], want: ['no', ['or', ['figure', 'swing'], ['figure', 'chain']]]},
   {op: 'not', from: ['and'], want: ['not', ['and']]},
   {op: 'not', from: ['no', ['figure', '*']], want: ['not', ['figure', '*']]},
   {op: 'not', from: ['or', ['figure', 'swing'], ['figure', 'chain']], want: ['not', ['or', ['figure', 'swing'], ['figure', 'chain']]]},
   {op: 'all', from: ['and'], want: ['all', ['and']]},
   {op: 'all', from: ['no', ['figure', '*']], want: ['all', ['figure', '*']]},
   {op: 'all', from: ['or', ['figure', 'swing'], ['figure', 'chain']], want: ['all', ['or', ['figure', 'swing'], ['figure', 'chain']]]},
   {op: 'count', from: ['and'], want: ['count', ['and'], '>', 0]},
   {op: 'count', from: ['no', ['figure', '*']], want: ['count', ['figure', '*'], '>', 0]},
   {op: 'count', from: ['or', ['figure', 'swing'], ['figure', 'chain']], want: ['count', ['or', ['figure', 'swing'], ['figure', 'chain']], '>', 0]},
  ].forEach(function({from, op, want}, i) {
    const fromEx = SearchEx.fromLisp(from);
    const got = fromEx.castTo(op).toLisp();
    test(`${fromEx}.castTo('${op}') ≈> ${JSON.stringify(want)}`, () => {
      expect(lispEquals(want, got)).toEqual(true);
    });
  });
});

test('casts', () => {
  ;
})

describe('ellipsis', () => {
  test('with parameters specified', () => {
    const searchEx = new FigureSearchEx({move: 'swing', parameters: ['*', '*', 8]});
    const bigLisp = ['figure', 'swing', '*', '*', 8];
    const shortLisp = ['figure', 'swing'];
    expect(lispEquals(searchEx.toLisp(), bigLisp)).toEqual(true);
    expect(searchEx.ellipsis).toEqual(true);
    searchEx.ellipsis = false;
    expect(searchEx.ellipsis).toEqual(false);
    expect(lispEquals(searchEx.toLisp(), shortLisp)).toEqual(true);
    searchEx.ellipsis = true;
    expect(searchEx.ellipsis).toEqual(true);
    expect(lispEquals(searchEx.toLisp(), bigLisp)).toEqual(true);
  });

  test('without parameters left off', () => {
    const searchEx = new FigureSearchEx({move: 'swing'});
    const bigLisp = ['figure', 'swing', '*', '*', '*'];
    const shortLisp = ['figure', 'swing'];
    expect(searchEx.ellipsis).toEqual(false);
    expect(lispEquals(searchEx.toLisp(), shortLisp)).toEqual(true);
    searchEx.ellipsis = true;
    expect(searchEx.ellipsis).toEqual(true);
    expect(lispEquals(searchEx.toLisp(), bigLisp)).toEqual(true);
    searchEx.ellipsis = false;
    expect(searchEx.ellipsis).toEqual(false);
    expect(lispEquals(searchEx.toLisp(), shortLisp)).toEqual(true);
  });
});
test('copy', () => {
  const originalLisp = ['and', ['figure', 'do si do'], ['figure', 'swing']];
  const original = SearchEx.fromLisp(originalLisp);
  const copy = original.copy();
  copy.subexpressions[0].move = 'circle';
  expect(lispEquals(copy.toLisp(), ['and', ['figure', 'circle'], ['figure', 'swing']])).toEqual(true);
  expect(lispEquals(original.toLisp(), originalLisp)).toEqual(true);
});