<script>
  import Textarea from '$lib/components/Textarea.svelte'
  import CodeBlock from '$lib/components/CodeBlock.svelte'

  let code = `Y := 0;
while X do {
    Y := cons 0, Y;
    X := tl X
}`
  let input = '(nil.nil)'
  let output = {}
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
      output.error = data.error
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
  <div class="flex flex-col mb-5 mx-2 lg:mx-20 mx-auto">
    <span class="pl-1 bg-gray-300">read X;</span>
    <Textarea  
      bind:value={code}
      minRows={5}
      maxRows={50}
    />  
    <span class="pl-1 bg-gray-300">write Y;</span>
  </div>

  <div class="flex flex-row mb-5 mx-2 lg:mx-20 mx-auto">
    <span class="mr-2">Input: </span>
    <input bind:value={input} class="w-full mx-auto border border-solid border-gray-300 bg-gray-200">
  </div>

  <button on:click={submit} class="w-20 p-2 mx-auto bg-gray-300 text-gray-600 border border-solid border-gray-600 rounded">
    Run
  </button>

  {#if output.error || output.string} 
    <section class="flex flex-col w-full mx-auto">
      <pre class="overflow-scroll border border-solid border-gray-400 my-5">
        <b>Output:</b>
        {#if output.error}
        {output.error === 'Bottom' ? 'Bottom' : `Error: ${output.error}`}
        {:else}
        Tree Notation: {output.string}
        List Notation: {output.listString}
        Number: {output.number} 
        {/if}
             
      </pre>
      <button on:click={() => showTree = !showTree} class="w-fit p-2 mx-auto mb-5 bg-gray-300 text-gray-600 border border-solid border-gray-600 rounded">
        {showTree ? 'Hide' : 'Show'} Output Tree
      </button>
      {#if showTree && output.image && !output.error}
        <div class="w-full mx-auto">
          {@html output.image}
        </div>
      {/if}
    </section>
  {/if}

</section>

<section class="flex flex-col w-full mx-auto">
  <h1 class="mb-2 text-center text-2xl text-gray-700">Syntax</h1>
  <hr/>
  <CodeBlock>
    <svelte:fragment slot="title">Expressions:</svelte:fragment>>
    <svelte:fragment slot="code">
    // constants
    // note: no 'nil', use 0
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
    </svelte:fragment>
  </CodeBlock>
  <CodeBlock>
    <svelte:fragment slot="title">
    Assign:
    </svelte:fragment>
    <svelte:fragment slot="code">
    Y := 0; // constant
    <hr/>
    Y := X; // variable
    <hr/>
    Y := {'<expr>'}; // expression
    </svelte:fragment>
  </CodeBlock>
  <CodeBlock>
    <svelte:fragment slot="title">
    If:
    </svelte:fragment>
    <svelte:fragment slot="code">
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
    </svelte:fragment>
  </CodeBlock>
  <CodeBlock>
    <svelte:fragment slot="title">
    While:
    </svelte:fragment>
    <svelte:fragment slot="code">
    while {'<expr>'} do {'{'}
      Y := cons 0, Y;
      X := tl X // note: no ';' here
    {'}'};
    <hr/>
    while {'<expr>'} do {'{ <command> '}};
    // note: no ';' after command,
    // but after {'}'}
    </svelte:fragment>
  </CodeBlock>
</section>

<style>
  :global(svg) {
    margin: 0 auto;
  }
</style>