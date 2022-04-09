import type { dTree } from 'src/types'

export const fetchImage = async (rawTree: string): Promise<string> => {
  let graph = 'graph{nodesep=1;ranksep=0.5;bgcolor="transparent";node [shape=point width=0.2];0;'
  const tree = await JSON.parse(rawTree)

  if (tree.head && tree.tail) {
    graph += addChildNodes(tree, '0')
  }

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

const addChildNodes = (tree: dTree, node: string): string => {
  const head = node + '0'
  const tail = node + '1'
  let code = node + '--' + head + ';' + node + '--' + tail + ';'
  if (tree.head?.head) code += addChildNodes(tree.head, head)
  if (tree.tail?.head) code += addChildNodes(tree.tail, tail)
  return code
}