import type { Com } from '../src/types';
import { compiler } from '../src/lib/compiler'

const progText1 = `
import sys
# Usage: python3 prog.py '<tree>' OR python3 prog.py <number>
# e.g: 
# python3 prog.py 1
# python3 prog.py 'nil'
# python3 prog.py '(nil.nil)'
# python3 prog.py '((nil.nil).nil)'
def main(X):
  # init variables
  Y = 0
  if str(X).isnumeric():
    X = numToTree(int(X))
  else:
    X = stringToTree(X)

  # compiled command begin
`
const progText2 = `
  # compiled command end

  return treeToString(Y)

def stringToTree(s):
  if s == "nil":
    return 0
  
  idx = s.find('.')
  if (idx == -1 or s[0] != '(' or s[-1] != ')'):
    exit("Error: Invalid tree string")
  
  if (s[1] == '('):
    count = 1
    for i in range(2, len(s)):
      if (s[i] == '('):
        count += 1
      elif (s[i] == ')'):
        count -= 1
      if (s[i] == '.' and count == 0):
        idx = i
        break

  head, tail = s[1:idx], s[idx+1:-1]
  return [stringToTree(head), stringToTree(tail)]

def treeToString(t):
  if t == 0:
    return "nil"
  return "(" + treeToString(t[0]) + "." + treeToString(t[1]) + ")"

def numToTree(n):
  if n == 0:
    return 0
  return [0, numToTree(n-1)]

def hd(t):
  if t == 0:
    return 0
  return t[0]

def tl(t):
  if t == 0:
    return 0
  return t[1]

if __name__ == "__main__":
  print(main(sys.argv[1]))`

const com1: Com = { // X := nil
  type: 'assign',
  varId: 1,
  expr: {
    type: 'quote',
    d: {}
  }
}
const com2: Com = { // X := Y
  type: 'assign',
  varId: 1,
  expr: {
    type: 'var',
    varId: 2
  }
}
const com3: Com = { // X := tl X
  type: 'assign',
  varId: 1,
  expr: {
    type: 'tl',
    expr: {
      type: 'var',
      varId: 1
    }
  }
}
const com4: Com = { // X := cons X Y
  type: 'assign',
  varId: 1,
  expr: {
    type: 'cons',
    expr1: {
      type: 'var',
      varId: 1
    },
    expr2: {
      type: 'var',
      varId: 2
    }
  }
}
const com5: Com = { // X := hd cons X Y
  type: 'assign',
  varId: 1,
  expr: {
    type: 'hd',
    expr: {
      type: 'cons',
      expr1: {
        type: 'var',
        varId: 1
      },
      expr2: {
        type: 'var',
        varId: 2
      }
    }
  }
}

// --------------------------------------------------

test('testing compiler: com1', () => {
  expect(compiler(com1)).toBe(progText1 + `  X = numToTree(0)` + progText2)
})
test('testing compiler: com2', () => {
  expect(compiler(com2)).toBe(progText1 + `  X = Y` + progText2)
})
test('testing compiler: com3', () => {
  expect(compiler(com3)).toBe(progText1 + `  X = tl(X)` + progText2)
})
test('testing compiler: com4', () => {
  expect(compiler(com4)).toBe(progText1 + `  X = [X,Y]` + progText2)
})
test('testing compiler: com5', () => {
  expect(compiler(com5)).toBe(progText1 + `  X = hd([X,Y])` + progText2)
})