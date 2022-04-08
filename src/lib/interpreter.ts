import type { dTree } from '../types'
import {
  treeToNum,
  hd,
  tl,
  cons,
  COM,
  EXPR
} from './while'

export const interpreter = (p: dTree, d: dTree): dTree => {
  let vars: dTree[] = Array(50).fill({}) // initialize variables to nil
  vars[treeToNum(hd(tl(hd(p))))] = d // inVar = d
  vars = execCom(hd(tl(p)), vars) // run program
  return vars[treeToNum(hd(tl(hd(tl(tl(p))))))] // return outVar
}

const evalExpr = (expr: dTree, vars: dTree[]): dTree => {
  switch (hd(expr)) {
    case EXPR.hd:
      return hd(evalExpr(hd(tl(expr)), vars))

    case EXPR.tl:
      return tl(evalExpr(hd(tl(expr)), vars))

    case EXPR.cons:
      return cons(
        evalExpr(hd(tl(expr)), vars), 
        evalExpr(hd(tl(tl(expr))), vars)
      )

    case EXPR.quote:
      return hd(tl(expr));

    case EXPR.var:
      return vars[treeToNum(hd(tl(expr)))]

    default:
      throw new Error('invalid expression')
  }
}

const execCom = (com: dTree, vars: dTree[]): dTree[] => {
  let varId: dTree
  let counter = 0

  switch (hd(com)) {
    case COM.assign:
      varId = hd(tl(hd(tl(com)))) // index of variable
      vars[treeToNum(varId)] = evalExpr(hd(tl(tl(com))), vars) // assign to variable
      break

    case COM.if:
      if (Object.keys(evalExpr(hd(tl(com)), vars)).length !== 0) { // if not nil
        vars = execCom(hd(tl(tl(com))), vars) // then
      } else {
        vars = execCom(hd(tl(tl(tl(com)))), vars) // else
      }
      break
    
    case COM.while:
      while (Object.keys(evalExpr(hd(tl(com)), vars)).length !== 0) { // while not nil
        vars = execCom(hd(tl(tl(com))), vars) // run command
        if (counter++ > 1000) { // detect infinite loop
          throw new Error('Bottom')
        }
      }
      break
    
    case COM.chain:
      vars = execCom(hd(tl(com)), vars) // first command
      vars = execCom(hd(tl(tl(com))), vars) // second command
      break

    default:
      throw new Error(`invalid command ${com}`)
  }

  return vars
}