import type { dTree, Expr, Com } from '../types'
import {
  numToTree,
  list,
  EXPR,
  COM
} from './while'

export const parser = (prog: string): dTree => {
  const vars = ['X', 'Y']

  const com = prog
    .replaceAll('\n', '')
    .replaceAll(';', '|')
    .replaceAll('{', '[')
    .replaceAll('}', ']')
    .split(/(\|)(?=(?:[^\]]|\[[^\]]*\])*$)/)
    .filter((line) => line !== '' && line !== '|')
    .map((line) => line.endsWith('|') ? line.slice(0, -1).trim() : line.trim())
    .map((line) => parseCom(line, vars))
    .reduce((com, c) => {
      if (com === undefined) return c
      return {
        type: 'chain',
        com1: com,
        com2: c
      }
    })
  
  // console.log('Finished compiling, com:', JSON.stringify(com, null, 2))
  return buildProgTree(buildComTree(com))
}

const parseExpr = (expr: string, vars: string[]): Expr => {
  const firstSpace = expr.indexOf(' ')
  let varId: number

  switch (true) {
    case /^cons/.test(expr):
      // cons E, F
      console.log('parsing cons expression:', expr)
      if (firstSpace === -1) throw new Error(`Invalid expression: ${expr}`)
      return {
        type: 'cons',
        expr1: parseExpr(expr.slice(4, expr.indexOf(',')).trim(), vars),
        expr2: parseExpr(expr.slice(expr.indexOf(',') + 1).trim(), vars)
      } 

    case /^hd/.test(expr):
      // hd E
      console.log('parsing hd expression:', expr)
      if (firstSpace === -1) throw new Error(`Invalid expression: ${expr}`)
      return {
        type: 'hd',
        expr: parseExpr(expr.slice(firstSpace + 1), vars)
      }

    case /^tl/.test(expr):
      // tl E
      console.log('parsing tl expression:', expr)
      if (firstSpace === -1) throw new Error(`Invalid expression: ${expr}`)
      return {
        type: 'tl',
        expr: parseExpr(expr.slice(firstSpace + 1), vars)
      }

    case /^list/.test(expr):
      // list E, F, G
      console.log('parsing list expression: ', expr)
      return expr
        .substring(firstSpace + 1)
        .split(',')
        .reverse()
        .map((arg) => parseExpr(arg.trim(), vars))
        .reduce((expr, e) => {
          return {
            type: 'cons',
            expr1: e,
            expr2: expr
          }
        }, { type: 'quote', d: {} })


    case /^[0-9]*$/.test(expr): // number
      console.log('parsing number expression:', expr)
      return {
        type: 'quote',
        d: numToTree(Number(parseInt(expr)))
      }

    case /^[a-zA-Z]*/.test(expr): // variable
      console.log('parsing variable expression:', expr)
      varId = vars.indexOf(expr) + 1
      if (varId === 0) varId = vars.push(expr)
      return {
        type: 'var',
        varId
      }

    default:
      throw new Error(`Invalid expression: ${expr}`);
  }
}

const parseCom = (com: string, vars: string[]): Com => {
  let expr: string
  let then: string
  let _else: string
  let _do: string
  let coms: string[]
  let varName: string
  let varId: number

  switch (true) {
    case /^if/.test(com):
      // if E then C else C
      console.log('parsing if command:', com)
      expr = com.split(' ', 2)[1].split('then', 2)[0].trim()
      then = com.slice(com.indexOf('then') + 4, com.indexOf('else')).trim()
      _else = com.slice(com.indexOf('else') + 4).trim()
      return {
        type: 'if',
        expr: parseExpr(expr, vars),
        then: parseCom(then, vars),
        _else: parseCom(_else, vars)
      }

    case /^while/.test(com):
      // while E do C
      console.log('parsing while command:', com)
      expr = com.split(' ', 2)[1].split('do', 2)[0].trim()
      _do = com.slice(com.indexOf('do') + 2)
      return {
        type: 'while',
        expr: parseExpr(expr, vars),
        do: parseCom(_do, vars)
      }
    
    case /\n*\t*\s*\[/.test(com): // chained commands
      console.log('parsing chained command:', com)
      coms = com.slice(com.indexOf('[') + 1, com.indexOf(']', com.indexOf('[') + 1)).split('|')      
      return coms
        .map((line) => parseCom(line.trim(), vars))
        .reduce((com, c) => {
          if (com === undefined) return c
          return {
            type: 'chain',
            com1: com,
            com2: c
          }
        })
      
    case /^\w/.test(com): // assign
      // V := E
      console.log('parsing assign command:', com)
      expr = com.split(':=', 2)[1].trim()
      varName = com.split(':=', 2)[0].trim()
      varId = vars.indexOf(varName) + 1
      if (varId === 0) varId = vars.push(varName)
      return {
        type: 'assign',
        varId,
        expr: parseExpr(expr, vars)
      }
    
    default:
      throw new Error(`Invalid command: ${com}`);
  }
}

export const buildProgTree = (com: dTree): dTree => {
  return list(
    list(EXPR.var, numToTree(1)), // inVar
    com,
    list(EXPR.var, numToTree(2)) // outVar
  )
}

export const buildComTree = (com: Com): dTree => {
  switch (com.type) {
    case 'assign':
      return buildAssignComTree(
        com.varId,
        buildExprTree(com.expr)
      )
    case 'if':
      return buildIfCom(
        buildExprTree(com.expr), 
        buildComTree(com.then),
        buildComTree(com._else)
      )
    case 'while':
      return buildWhileCom(
        buildExprTree(com.expr), 
        buildComTree(com.do)
      )
    case 'chain':
      return buildChainCom(
        buildComTree(com.com1),
        buildComTree(com.com2)
      )
  }
}

const buildExprTree = (expr: Expr): dTree => {
  switch (expr.type) {
    case 'quote':
      return list(
        EXPR.quote,
        expr.d
      )
    case 'hd':
      return list(
        EXPR.hd,
        buildExprTree(expr.expr)
      )
    case 'tl':
      return list(
        EXPR.tl,
        buildExprTree(expr.expr)
      )
    case 'var':
      return list(
        EXPR.var,
        numToTree(expr.varId)
      )
    case 'cons':
      return list(
        EXPR.cons,
        buildExprTree(expr.expr1),
        buildExprTree(expr.expr2)
      )
  }
}

const buildAssignComTree = (varId: number, expr: dTree): dTree => {
  return list(
    COM.assign,
    list(EXPR.var, numToTree(varId)),
    expr
  )
}

const buildIfCom = (expr: dTree, then: dTree, _else: dTree): dTree => {
  return list(
    COM.if,
    expr,
    then,
    _else
  )
}

const buildWhileCom = (expr: dTree, com: dTree): dTree => {
  return list(
    COM.while,
    expr,
    com
  )
}

const buildChainCom = (com1: dTree, com2: dTree): dTree => {
  return list(
    COM.chain,
    com1,
    com2
  )
}