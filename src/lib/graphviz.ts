import type { dTree } from 'src/types'

export const fetchImage = async (rawTree: string): Promise<string> => {
  let graph = 'graph{nodesep=1;ranksep=0.5;bgcolor="transparent";node [shape=point width=0.2];1;'
  const tree = await JSON.parse(rawTree)

  if (tree.head && tree.tail) graph += addNodes(tree)

  graph += '}'

  const res = await fetch('/svg', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ graph })
  })

  if (!res.ok) throw new Error('failed to fetch svg')

  const data = await res.json()
  return data.svg
}

const addNodes = (root: dTree): string => {
  let code = ''
  let n = 0
  let nodeNum = 0
  const queue = [root];
  while (queue.length > 0) {
    const node = queue.shift(); // mutates the queue
    nodeNum = n
    if (node.head) {
      code += nodeNum +'--'+ (++n) + ';'
      queue.push(node.head)
    }
    if (node.tail) {
      code += nodeNum +'--'+ (++n) + ';'
      queue.push(node.tail)
    }
  }
  return code
}