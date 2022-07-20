/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ request }) {
  const data = await request.json()
  const { graph } = data
  console.log(graph)
  try {
    const res = await fetch('https://quickchart.io/graphviz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ graph })
    })
    const svg = await res.text()
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        svg
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