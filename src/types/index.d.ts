export type dTree = {
  head?: dTree,
  tail?: dTree
}

export type Com = {
  type: 'while',
  expr: Expr,
  do: Com,
} | {
  type: 'if',
  expr: Expr,
  then: Com,
  _else: Com
} | {
  type: 'assign',
  varId: number,
  expr: Expr
} | {
  type: 'chain',
  com1: Com,
  com2: Com
}

export type Expr = {
  type: 'quote',
  d: dTree,
} | {
  type: 'hd' | 'tl',
  expr: Expr
} | {
  type: 'var',
  varId: number
} | {
  type: 'cons',
  expr1: Expr,
  expr2: Expr
}

// export function treeToString(): string;

// export function treeToListString(): string;

// export function stringToTree(): dTree;

// export function isValidTree(): boolean;

// export function numToTree(): dTree;

// export function treeToNum(): number;

// export function hd(): dTree;

// export function tl(): dTree;

// export function cons(): dTree;

// export function list(): dTree;

// export function interpreter(): dTree;

// export function parser(): dTree;

// export const COM: { [key: string]: dTree };

// export const EXPR: { [key: string]: dTree };



