import type { dTree } from '../src/types'
import { 
  isValidTree,
  treeToString, 
  treeToListString, 
  stringToTree,
} from '../src/lib/while'

// ------------------------------------------------------------

const d1: dTree = {
  head: {
    head: {},
    tail: {}
  },
  tail: {}
}

const d2: dTree = {
  head: {
    head: {
      head: {},
      tail: {}
    },
    tail: {}
  },
  tail: {
    head: {},
    tail: {}
  }
}

const d3: dTree = {
  head: {
    head: {
      head: {},
      tail: {}
    },
    tail: {
      head: {},
      tail: {}
    }
  },
  tail: {
    head: {},
    tail: {}
  }
}

const treeStrings = [
  'nil',
  '(nil.nil)',
  '(nil.(nil.nil))',
  '(nil.(nil.(nil.nil)))',
  '((nil.nil).nil)',
  '((nil.(nil.nil)).nil)',
]

// ------------------------------------------------------------

test('testing isValidTree', () => {
  expect(isValidTree(d1)).toBe(true)
  expect(isValidTree(d2)).toBe(true)
  expect(isValidTree(d3)).toBe(true)
  expect(isValidTree({})).toBe(true)
  expect(isValidTree({ head: {} })).toBe(false)
  expect(isValidTree({ tail: {} })).toBe(false)
  expect(isValidTree({
    head: {
      head: {}
    },
    tail: {}
  })).toBe(false)
});

// ------------------------------------------------------------

test('testing treeToString', () => {
  const error = 'invalid tree'
  expect(treeToString(d1)).toBe('((nil.nil).nil)');
  expect(treeToString(d2)).toBe('(((nil.nil).nil).(nil.nil))');
  expect(treeToString(d3)).toBe('(((nil.nil).(nil.nil)).(nil.nil))');
  expect(() => treeToString({ head: {} })).toThrowError(error);
  expect(() => treeToString({ tail: {} })).toThrowError(error);
  expect(() => treeToString({
    head: {
      head: {}
    },
    tail: {}
  })).toThrowError(error);
});

// ------------------------------------------------------------

test('testing treeToListString', () => {
  expect(treeToListString(d1)).toBe('((()))');
  expect(treeToListString(d2)).toBe('(((())) ())');
  expect(treeToListString(d3)).toBe('(((()) ()) ())');
});

// ------------------------------------------------------------

test.each(treeStrings)('testing stringToTree (valid strings)', (t) => {
    expect(treeToString(stringToTree(t))).toBe(t);
});

test('testing stringToTree 2 (invalid strings)', () => {
  const error = 'invalid tree string'
  expect(() => stringToTree('')).toThrowError(error);
  expect(() => stringToTree('nil.nil')).toThrowError(error);
  expect(() => stringToTree('nil.nil.nil')).toThrowError(error);
  expect(() => stringToTree('(nil.nil.nil)')).toThrowError(error);
  expect(() => stringToTree('(nil.nil).nil)')).toThrowError(error);
  expect(() => stringToTree('(nil.nil')).toThrowError(error);
  expect(() => stringToTree('(nil().nil)')).toThrowError(error);
  expect(() => stringToTree('(nil).nil')).toThrowError(error);
  expect(() => stringToTree('(nil).(nil)')).toThrowError(error);
});