import type { dTree } from '../types'

export const treeToString = (tree: dTree): string => {
  if (!isValidTree(tree)) throw new Error('invalid tree')

  if (tree.head && tree.tail) {
    return '(' + treeToString(tree.head) + '.' + treeToString(tree.tail) + ')'
  }

  return 'nil'
}

export const treeToListString = (tree: dTree): string => {
  if (!isValidTree(tree)) throw new Error('invalid tree')

  if (tree === {}) {
    return '()'
  }

  let result = '('

  while (tree.head) {
    result += treeToListString(tree.head) + ' '
    tree = tree.tail || {}
  }

  result += ')'

  return result.endsWith(' )') ? result.slice(0, -2) + ')' : result
}

export const stringToTree = (s: string): dTree => {
  const tree: dTree = {}

  if (s === 'nil') return tree

  const idx = (/^\(+/).test(s.slice(1)) ? s.lastIndexOf(').') + 1 : s.indexOf('.')
  if (idx === -1) throw new Error('invalid tree string')
  
  const [head, tail] = [s.slice(1, idx), s.slice(idx + 1, s.length - 1)]

  tree.head = stringToTree(head)
  tree.tail = stringToTree(tail)

  return tree
}

export const isValidTree = (tree: dTree): boolean => {
  if (!tree.head && !tree.tail) return true
  if (!tree.head && tree.tail) return false
  if (tree.head && !tree.tail) return false
  if (tree.head && tree.tail) return isValidTree(tree.head) && isValidTree(tree.tail)
  return false
}

export const COM: { [key: string]: dTree } = {
  while: stringToTree('((nil.nil).(nil.nil))'),
  if: stringToTree('(((nil.nil).nil).(nil.nil))'),
  assign: stringToTree('((nil.(nil.nil)).(nil.nil))'),
  chain: stringToTree('(((nil.nil).(nil.nil)).(nil.nil))')
}

export const EXPR: { [key: string]: dTree } = {
  hd: stringToTree('((((nil.nil).nil).(nil.nil)).(nil.nil))'),
  tl: stringToTree('(((nil.(nil.nil)).(nil.nil)).(nil.nil))'),
  cons: stringToTree('((((nil.nil).(nil.nil)).(nil.nil)).(nil.nil))'),
  quote: stringToTree('(((((nil.nil).nil).(nil.nil)).(nil.nil)).(nil.nil))'),
  var: stringToTree('(((((nil.nil).(nil.nil)).(nil.nil)).(nil.nil)).(nil.nil))')
}

export const hd = (tree: dTree): dTree => {
  return tree.head || {}
}

export const tl = (tree: dTree): dTree => {
  return tree.tail || {}
}

export const cons = (d1: dTree, d2: dTree): dTree => {
  return {
    head: d1,
    tail: d2
  }
}

export const list = (...args: dTree[]): dTree => {
  let result: dTree = {}

  for (let i = args.length - 1; i >= 0; i--) {
    result = cons(args[i], result)
  }

  return result
}

export const treeToNum = (tree: dTree | undefined): number => {
  if (Object.keys(tree).length === 0) return 0
  if (tree?.head?.head || tree?.head?.tail) return NaN
  if (tree?.tail) return 1 + treeToNum(tree?.tail)
  return 0
}

export const numToTree = (n: number): dTree => {
  if (n === 0) return {}
  return {
    head: {},
    tail: numToTree(n - 1)
  }
}

