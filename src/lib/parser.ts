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
    .replace(/\n/g, '')
    .replace(/;/g, '|')
    .replace(/{/g, '[')
    .replace(/}/g, ']')
    .replace(/nil/g, '0')
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
      if (firstSpace === -1) throw new Error(`Invalid expression: ${expr}`)
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
  switch (true) {
    case /^if/.test(com):
      // if E then C else C
      console.log('parsing if command:', com)
      if (!com.includes('then') || !com.includes('else')) {
        throw new Error(`Invalid if command: ${com}`)
      }
      return {
        type: 'if',
        expr: parseExpr(
          com.split(' ', 2)[1].split('then', 2)[0].trim(),
          vars
        ),
        then: parseCom(
          com.slice(com.indexOf('then') + 4, com.indexOf('else')).trim(),
          vars
        ),
        _else: parseCom(
          com.slice(com.indexOf('else') + 4).trim(), 
          vars
        )
      }

    case /^while/.test(com):
      // while E do C
      console.log('parsing while command:', com)
      if (!com.includes('do')) throw new Error(`Invalid while command: ${com}`)
      return {
        type: 'while',
        expr: parseExpr(
          com.slice(5).split('do')[0].trim(),
          vars
        ),
        do: parseCom(
          com.slice(com.indexOf('do') + 2),
          vars
        )
      }
    
    case /\n*\t*\s*\[/.test(com): // chained commands
      // [ C1 ; C2 ; C3 ]
      console.log('parsing chained command:', com)
      if (!com.includes(']')) throw new Error(`Invalid command: ${com}`)
      return com
        .slice(com.indexOf('[') + 1, com.indexOf(']', com.indexOf('[') + 1))
        .split('|')
        .map((line) => parseCom(line.trim(), vars))
        .reduce((com, c) => {
          if (com === undefined) return c
          return {
            type: 'chain',
            com1: com,
            com2: c
          }
        })
      
    case /^[A-Za-z]/.test(com): { // assign
      // V := E
      console.log('parsing assign command:', com)
      if (!com.includes(':=')) throw new Error(`Invalid command: ${com}`)
      const varName = com.split(':=', 2)[0].trim()
      return {
        type: 'assign',
        varId: vars.indexOf(varName) === -1 ? vars.push(varName) : vars.indexOf(varName) + 1,
        expr: parseExpr(
          com.split(':=', 2)[1].trim(),
          vars
        )
      }
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
      return list(
        COM.assign,
        list(EXPR.var, numToTree(com.varId)),
        buildExprTree(com.expr)
      )

    case 'if':
      return list(
        COM.if,
        buildExprTree(com.expr),
        buildComTree(com.then),
        buildComTree(com._else)
      )

    case 'while':
      return list(
        COM.while,
        buildExprTree(com.expr),
        buildComTree(com.do)
      )

    case 'chain':
      return list(
        COM.chain,
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