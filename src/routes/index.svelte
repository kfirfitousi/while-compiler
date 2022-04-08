<script>
  import Textarea from '$lib/components/Textarea.svelte'

  let code = `Y := 0;
while X do {
  Y := cons 0, Y;
  X := tl X
}`
  let input = '(nil.nil)'
  let output

  const submit = async () => {
    const res = await fetch('/compile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code, input })
    })
    const data = await res.json();
    
    output = res.ok ? data : data.error

    if (res.ok) {
      output = data
      await fetchImage()
    } else {
      output = data.error
    }
  }

  const fetchImage = async () => {
    let graph = 'graph{nodesep=1;ranksep=0.5;bgcolor="transparent";node [shape=point width=0.2];'
    let tree = await JSON.parse(output.raw)
    let node = 1
    console.log({tree})

    if (tree.head && tree.tail) {
      graph = addChildNodes(graph, node, tree)
    }

    graph += '}'
    console.log(graph)

    const res = await fetch('/svg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ graph })
    })

    if (res.ok) {
      const data = await res.json()
      console.log('data', data)
      output.image = data.svg
      // output.image = data.src
    }
  }

  const addChildNodes = (code, node, tree) => {
    code += `${node}--${2*node + 1};${node}--${2*node + 2};`
    
    if (tree.head?.head)
      code = addChildNodes(code, 2*node + 1, tree.head)

    if (tree.tail?.head)
      code = addChildNodes(code, 2*node + 2, tree.tail)

    return code
  }

</script>

<h1 class="mb-4 text-center text-4xl text-gray-700">WHILE compiler</h1>
<hr/>

<section class="flex flex-col w-full mx-auto mt-5 text-gray-700">

  <div class="flex flex-col mb-5 w-2/3 mx-auto">
    <span>read X;</span>
    <Textarea  
      bind:value={code}
      minRows={5}
      maxRows={50}
    />  
    <span>write Y;</span>
  </div>

  <div class="flex flex-row mb-5 w-2/3 mx-auto">
    <span class="mr-2">Input: </span>
    <input bind:value={input} class="w-full mx-auto border-solid border border-gray-300 bg-gray-200">
  </div>

  <button class="w-20 p-2 mx-auto bg-gray-300 text-gray-600 border-solid border border-gray-600" on:click={submit}>Run</button>


  {#if output}
    <section class="w-2/3 mx-auto">
      <pre>
        Output:
        Tree notation: {output.string}
        List Notation: {output.listString}
        Number: {output.number}      
      </pre>
      {#if output.image}
        <div class="w-full mx-auto">
          {@html output.image}
          <!-- <img class="w-full mx-auto" src={output.image} alt="tree"/> -->
        </div>
      {/if}
    </section>
  {/if}

</section>

<style>
  :global(svg) {
    margin: 0 auto;
  }
</style>