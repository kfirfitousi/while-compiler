import { interpreter } from '../src/lib/interpreter'
import { buildComTree, buildProgTree, parser } from '../src/lib/parser'
import { 
  stringToTree,
  numToTree,
  list,
  cons,
  hd,
  tl,
  COM, 
  EXPR,
} from '../src/lib/while'

const treeStrings = [
  'nil',
  '(nil.nil)',
  '(nil.(nil.nil))',
  '(nil.(nil.(nil.nil)))',
  '((nil.nil).nil)',
  '((nil.(nil.nil)).nil)',
]

const lengths = [
  0, // 'nil'
  1, // '(nil.nil)',
  2, // '(nil.(nil.nil))',
  3, // '(nil.(nil.(nil.nil)))',
  1, // '((nil.nil).nil)',
  1  // '((nil.(nil.nil)).nil)',
]

const nums = [1, 7, 13, 20, 42, 59, 100, 239, 3000]

const sums = [
  [1, 1, 2],
  [1, 2, 3],
  [3, 3, 6],
  [9, 5, 14],
  [10, 20, 30],
  [51, 123, 174]
]

// ------------------------------------------------------------

test.each(treeStrings)('testing parser: prog1', (str) => {
  const progText = 'Y := 7'
  const progCom = parser(progText)
  const prog = buildProgTree(buildComTree(progCom))
  const input = stringToTree(str)

  expect(prog).toStrictEqual(
    list(
      list(EXPR.var, numToTree(1)),
      
      list(
        COM.assign,
        list(EXPR.var, numToTree(2)),
        list(EXPR.quote, numToTree(7))
      ),
  
      list(EXPR.var, numToTree(2))
    )
  )
  expect(interpreter(prog, input))
    .toStrictEqual(numToTree(7))
})

// ------------------------------------------------------------

test.each(nums)('testing parser: prog2 (ident)', (n) => {
  const progText = 'Y := X'
  const progCom = parser(progText)
  const prog = buildProgTree(buildComTree(progCom))
  const input = numToTree(n)

  expect(prog).toStrictEqual(
    list(
      list(EXPR.var, numToTree(1)),
      
      list(
        COM.assign,
        list(EXPR.var, numToTree(2)),
        list(EXPR.var, numToTree(1))
      ),
  
      list(EXPR.var, numToTree(2))
    )
  )
  expect(interpreter(prog, input))
    .toStrictEqual(numToTree(n))
})

// ------------------------------------------------------------

test.each(treeStrings)('testing parser: prog3 (len)', (str) => {
  const progText = 
  `Y := 0;
  while X do {
    Y := cons 0, Y;
    X := tl X
  }`
  const progCom = parser(progText)
  const prog = buildProgTree(buildComTree(progCom))
  const input = stringToTree(str)

  expect(interpreter(prog, input))
    .toStrictEqual(numToTree(lengths[treeStrings.indexOf(str)]))
})

// ------------------------------------------------------------

test.each(treeStrings)('testing parser: prog4 (infinite loop)', (str) => {
  const progText = 
  `Y := 1;
  if Y then
    while 1 do {
      X := tl X;
      Y := cons 0, Y
    }
  else 
    Y := 0`
  const progCom = parser(progText)
  const prog = buildProgTree(buildComTree(progCom))
  const input = stringToTree(str)

  expect(() => interpreter(prog, input))
    .toThrowError('Bottom')
})

// ------------------------------------------------------------

test.each(sums)('testing parser: prog5 (sum)', (a, b, sum) => {
  const progText = 
  `A := hd X;
  B := tl X;
  Y := 0;
  while A do {
    Y := cons 0, Y;
    A := tl A
  };
  while B do {
    Y := cons 0, Y;
    B := tl B
  }`
  const progCom = parser(progText)
  const prog = buildProgTree(buildComTree(progCom))
  const input = cons(numToTree(a), numToTree(b)) // (a.b)

  expect(interpreter(prog, input))
    .toStrictEqual(numToTree(sum))
})

// ------------------------------------------------------------

test.each(treeStrings)('testing parser: prog6 (list)', (str) => {
  const progText = 'Y := list X, 1, 2, 3'
  const progCom = parser(progText)
  const prog = buildProgTree(buildComTree(progCom))
  const input = stringToTree(str)

  expect(interpreter(prog, input)).toStrictEqual(
    list(
      input,
      numToTree(1), 
      numToTree(2), 
      numToTree(3))
  )
})
// ------------------------------------------------------------

test.each(treeStrings)('testing parser: prog7 (list2)', (str) => {
  const progText =
  `Z := cons X, X;
  Y := list 1, hd X, tl X, Z;`
  const progCom = parser(progText)
  const prog = buildProgTree(buildComTree(progCom))
  const input = stringToTree(str)

  expect(interpreter(prog, input)).toStrictEqual(
    list(
      numToTree(1), 
      hd(input),
      tl(input),
      cons(input, input)
    )
  )
})