import { parser } from '$lib/parser';
import { interpreter } from '$lib/interpreter';
import { stringToTree, treeToString } from '$lib/while';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function post({ request }) {
  const data = await request.json()
  const { code, input } = data
  console.log(code)
  console.log(input)
  try {
    const prog = parser(code)
    const result = treeToString(interpreter(prog, stringToTree(input)))
    return {
      status: 200,
      body: {
        result
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