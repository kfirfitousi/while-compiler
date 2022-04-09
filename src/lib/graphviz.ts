import type { dTree } from 'src/types'

export const fetchImage = async (rawTree: string): Promise<string> => {
  let graph = 'graph{nodesep=1;ranksep=0.5;bgcolor="transparent";node [shape=point width=0.2];1;'
  const tree = await JSON.parse(rawTree)

  if (tree.head && tree.tail) {
    graph = addChildNodes(graph, 1, tree)
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

const addChildNodes = (code: string, node: number, tree: dTree): string => {
  code += `${node}--${2*node + 1};${node}--${2*node + 2};`
  if (tree.head?.head) code = addChildNodes(code, 2*node + 1, tree.head)
  if (tree.tail?.head) code = addChildNodes(code, 2*node + 2, tree.tail)
  return code
}