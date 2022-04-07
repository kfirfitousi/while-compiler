import type { dTree } from '../src/types'
import { interpreter } from '../src/lib/interpreter'
import { 
  stringToTree,
  numToTree,
  list,
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

// ------------------------------------------------------------

test.each(treeStrings)('testing interpreter: prog1', (str) => {
  // read X;
  //    Y := 7;
  // write Y;
  const prog1: dTree = list(
    list(EXPR.var, numToTree(1)), // inVar
    
    list(
      COM.assign,
      list(EXPR.var, numToTree(2)),
      list(EXPR.quote, numToTree(7))
    ),

    list(EXPR.var, numToTree(2)) // outVar
  )
  const input = stringToTree(str)

  expect(interpreter(prog1, input))
    .toStrictEqual(numToTree(7))
})

// ------------------------------------------------------------

test.each(treeStrings)('testing interpreter: prog2 (infinite loop)', (str) => {
  // read X;
  //  while 1 do
  //    X := X;
  // write Y;
  const prog2: dTree = list(
    list(EXPR.var, numToTree(1)), // inVar
    
    list(
      COM.while,
      list(EXPR.quote, numToTree(1)),
      list(
        COM.assign,
        list(EXPR.var, numToTree(1)),
        list(EXPR.var, numToTree(1))
      )
    ),

    list(EXPR.var, numToTree(2)) // outVar
  )
  const input = stringToTree(str)

  expect(() => interpreter(prog2, input))
    .toThrowError('infinite loop')
})

// ------------------------------------------------------------

test.each(treeStrings)('testing interpreter:  prog3', (str) => {
  // read X;
  //  if X then Y := 1 else Y := 0;
  //  Y := cons nil Y;
  // write Y;
  const prog3: dTree = list(
    list(EXPR.var, numToTree(1)), // inVar
    
    list(
      COM.chain,
      list( // if
        COM.if,
        list(EXPR.var, numToTree(1)),
        list( // then
          COM.assign,
          list(EXPR.var, numToTree(2)),
          list(EXPR.quote, numToTree(1))
        ),
        list( // else
          COM.assign,
          list(EXPR.var, numToTree(2)),
          list(EXPR.quote, numToTree(0))
        )
      ),
      list( // Y := cons nil Y
        COM.assign,
        list(EXPR.var, numToTree(2)),
        list(
          EXPR.cons,
          list(EXPR.quote, numToTree(0)),
          list(EXPR.var, numToTree(2))
        )
      )
    ),

    list(EXPR.var, numToTree(2)) // outVar
  )
  const input = stringToTree(str)
      
  expect(interpreter(prog3, input))
    .toStrictEqual(numToTree(str === 'nil' ? 1 : 2))
})

// ------------------------------------------------------------

test.each(treeStrings)('testing interpreter:  prog4 (len)', (tree) => {
  // read X;
  //   Y := 0;
  //   while X do
  //    Y := cons nil Y;
  //    X := tl x;
  // write Y;
  const prog4: dTree = list(
    list(EXPR.var, numToTree(1)), // inVar
    
    list(
      COM.chain,
      list( // Y := 0
        COM.assign,
        list(EXPR.var, numToTree(2)),
        list(EXPR.quote, numToTree(0))
      ),
      list( // while X do
        COM.while,
        list(EXPR.var, numToTree(1)),
        list(
          COM.chain,
          list( // Y := cons nil Y
            COM.assign,
            list(EXPR.var, numToTree(2)),
            list(
              EXPR.cons,
              list(EXPR.quote, numToTree(0)),
              list(EXPR.var, numToTree(2))
            )
          ),
          list( // X := tl x
            COM.assign,
            list(EXPR.var, numToTree(1)),
            list(EXPR.tl, list(EXPR.var, numToTree(1)))
          )
        )
      )
    ),

    list(EXPR.var, numToTree(2)) // outVar
  )

  expect(interpreter(prog4, stringToTree(tree)))
    .toStrictEqual(numToTree(lengths[treeStrings.indexOf(tree)]))
})