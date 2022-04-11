import { buildComTree, buildProgTree, parser } from '$lib/parser';
import { interpreter } from '$lib/interpreter';
import { stringToTree, treeToString, treeToListString, treeToNum, numToTree } from '$lib/while';
import { compiler } from '$lib/compiler';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function post({ request }) {
  const data = await request.json()
  const { code } = data
  let { input } = data
  try {
    if ((/^[0-9]*$/).test(input)) { // input is a number
      input = numToTree(parseInt(input))
    } else { // input is a string
      input = stringToTree(input)
    }
    const com = parser(code)
    const pyProg = compiler(com)
    const prog = buildProgTree(buildComTree(com))
    const output = interpreter(prog, input)
    const number = treeToNum(output)
    return {
      status: 200,
      body: {
        raw: JSON.stringify(output, null, 2),
        string: treeToString(output),
        listString: treeToListString(output),
        number: isNaN(number) ? -1 : number,
        pyProg
      }
    }
  } catch (e) {
    return {
      status: 400,
      body: {
        error: e.message,
      }
    }
  }
}