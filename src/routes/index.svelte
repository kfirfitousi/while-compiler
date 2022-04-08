<script>
  import Textarea from '$lib/components/Textarea.svelte'

  let code = `Y := 0;
while X do {
  Y := cons 0, Y;
  X := tl X
}`
  let input = '(nil.nil)'
  let output
  let showTree = false

  const submit = async () => {
    const res = await fetch('/compile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code, input })
    })
    const data = await res.json();
    
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

    if (tree.head && tree.tail) {
      graph = addChildNodes(graph, node, tree)
    }

    graph += '}'

    const res = await fetch('/svg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ graph })
    })

    if (res.ok) {
      const data = await res.json()
      output.image = data.svg
    }
  }

  const addChildNodes = (code, node, tree) => {
    code += `${node}--${2*node + 1};${node}--${2*node + 2};`
    if (tree.head?.head) code = addChildNodes(code, 2*node + 1, tree.head)
    if (tree.tail?.head) code = addChildNodes(code, 2*node + 2, tree.tail)
    return code
  }

</script>

<h1 class="mb-4 text-center text-4xl text-gray-700">
  WHILE compiler
</h1>
<hr/>

<section class="flex flex-col w-full mx-auto my-5 text-gray-700">

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
    <input bind:value={input} class="w-full mx-auto border border-solid border-gray-300 bg-gray-200">
  </div>

  <button on:click={submit} class="w-20 p-2 mx-auto bg-gray-300 text-gray-600 border border-solid border-gray-600 rounded">
    Run
  </button>

  {#if output}
    <section class="flex flex-col w-full mx-auto">
      <pre class="overflow-scroll border border-solid border-gray-400 my-5">
        <b>Output:</b>
        Tree notation: {output.string}
        List Notation: {output.listString}
        Number: {output.number}      
      </pre>
      <button on:click={() => showTree = !showTree} class="w-fit p-2 mx-auto mb-5 bg-gray-300 text-gray-600 border border-solid border-gray-600 rounded">
        {showTree ? 'Hide' : 'Show'} Output Tree
      </button>
      {#if showTree && output.image}
        <div class="w-full mx-auto">
          {@html output.image}
          <!-- <img class="w-full mx-auto" src={output.image} alt="tree"/> -->
        </div>
      {/if}
    </section>
  {/if}

</section>

<section class="flex flex-col">
  <h1 class="mb-2 text-center text-2xl text-gray-700">Syntax</h1>
  <hr/>
  <div class="mt-5 flex flex-row items-stretch justify-center">
    <h2 class="text-center w-24 bg-gray-200 mx-0 my-0 pt-6">Assign:</h2>
    <pre class="bg-gray-500 text-gray-100 w-2/3 mx-0">
      Y := 0; // constant
      <hr/>
      Y := X; // variable
      <hr/>
      Y := {'<expr>'}; // expression
    </pre>
  </div>
  <div class="mt-5 flex flex-row items-stretch justify-center">
    <h2 class="text-center w-24 bg-gray-200 mx-0 my-0 pt-6">If:</h2>
    <pre class="bg-gray-500 text-gray-100 w-2/3 mx-0">
      if {'<expr>'} then
        {'<command>'}  // note: no ';' here
      else
        {'<command>'}; // note: ';' here
      <hr/>
      if {'<expr>'} then {'{'}
        {'<command>'}; // note: ';' here
        {'<command>'};
        {'<command>'}  // note: no ';' here
      {'}'} else {'{'}
        {'<command>'};
        {'<command>'}
      {'}'};
    </pre>
  </div>
  <div class="my-5 flex flex-row items-stretch justify-center">
    <h2 class="text-center w-24 bg-gray-200 mx-0 my-0 pt-6">While:</h2>
    <pre class="bg-gray-500 text-gray-100 w-2/3 mx-0">
      while {'<expr>'} do {'{'}
        Y := cons 0, Y;
        X := tl X // note: no ';' here
      {'}'};
      <hr/>
      while {'<expr>'} do {'{ <command> '}};
      // note: no ';' after command,
      // but after {'}'}
    </pre>
  </div>
  <div class="my-5 flex flex-row items-stretch justify-center">
    <h2 class="text-center text-xs w-24 bg-gray-200 mx-0 my-0 pt-6">Expressions:</h2>
    <pre class="bg-gray-500 text-gray-100 w-2/3 mx-0">
      // constants
      // note: cannot use 'nil', use 0
      1
      3
      14
      <hr/>
      // variables
      X
      Y
      Z
      customVar
      <hr/>
      tl {'<expr>'}
      hd {'<expr>'}
      <hr/>
      cons {'<expr>'}, {'<expr>'}
      // note: ',' seperates expressions
      <hr/>
      list {'<expr>'}, {'<expr>'}, {'<expr>'}
      // note: ',' seperates expressions
      // note: cannot use cons with list
    </pre>
  </div>
</section>

<style>
  :global(svg) {
    margin: 0 auto;
  }
</style>