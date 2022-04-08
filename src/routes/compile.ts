import { parser } from '$lib/parser';
import { interpreter } from '$lib/interpreter';
import { stringToTree, treeToString, treeToListString, treeToNum } from '$lib/while';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function post({ request }) {
  const data = await request.json()
  const { code, input } = data
  try {
    const prog = parser(code)
    const output = interpreter(prog, stringToTree(input))
    const number = treeToNum(output)
    return {
      status: 200,
      body: {
        raw: JSON.stringify(output, null, 2),
        string: treeToString(output),
        listString: treeToListString(output),
        number: number === -1 ? 'not a number' : number
      }
    }
  } catch (e) {
    return {
      status: 400,
      body: {
        error: e.message
      }
    }
  }
}