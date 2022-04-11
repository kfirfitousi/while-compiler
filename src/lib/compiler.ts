import type { Com, Expr } from "src/types"
import {
  treeToNum
} from '$lib/while'

export const compiler = (com: Com): string => {
  const vars = ['X', 'Y']
  return `
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
${pyCom(com, vars, 1)}
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
}

const pyCom = (com: Com, vars: string[], tab=0): string => {
  switch(com.type) {
    case 'assign': {
      let varName = vars[com.varId-1] 
      if (!varName) varName = `var${com.varId}`
      return `${'  '.repeat(tab)}${varName} = ${pyExpr(com.expr, vars)}`
    }
    case 'if':
      return `${'  '.repeat(tab)}if ${pyExpr(com.expr, vars)}:\n${pyCom(com.then, vars, tab+1)}\n${'  '.repeat(tab)}else:\n${pyCom(com._else, vars, tab+1)}`
    case 'while':
      return `${'  '.repeat(tab)}while ${pyExpr(com.expr, vars)}:\n${pyCom(com.do, vars, tab+1)}`
    case 'chain':
      return `${pyCom(com.com1, vars, tab)}\n${pyCom(com.com2, vars, tab)}`
  }
}

const pyExpr = (expr: Expr, vars: string[]): string => {
  switch(expr.type) {
    case 'hd':
      return `hd(${pyExpr(expr.expr, vars)})`
    case 'tl':
      return `tl(${pyExpr(expr.expr, vars)})`
    case 'cons':
      return `[${pyExpr(expr.expr1, vars)},${pyExpr(expr.expr2, vars)}]`
    case 'quote':
      return `numToTree(${treeToNum(expr.d)})`
    case 'var': {
      let varName = vars[expr.varId-1]
      if (!varName) varName = `var${expr.varId}`
      return `${varName}`
    }
  }
}