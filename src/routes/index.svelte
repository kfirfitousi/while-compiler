<script lang="ts">
  import type { CompileOutput } from 'src/types'
  import { fetchImage } from '$lib/graphviz'
  import CodeBlock from '$lib/components/CodeBlock.svelte'
  import Textarea from '$lib/components/Textarea.svelte'

  let code = `Y := 0;
while X do {
    Y := cons 0, Y;
    X := tl X
}`
  let input = '(nil.nil)'
  let output: CompileOutput = {}
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
    
    if (!res.ok) {
      output.error = data.error
      return
    }
    
    output = data
    
    try {
      output.image = await fetchImage(output.raw)
    }
    catch (e) {
      console.error(e)
    }
  }
</script>

<h1 class="mb-4 text-center text-4xl text-gray-200">
  WHILE Compiler
</h1>
<hr/>

<section class="flex flex-col w-full mx-auto my-5">
  <div class="flex flex-col mb-5 mx-2 lg:mx-20 mx-auto">
    <span class="pl-1 bg-gray-300 text-gray-600 border-t border-x border-solid border-gray-800">read X;</span>
    <Textarea  
      bind:value={code}
      minRows={5}
    />  
    <span class="pl-1 bg-gray-300 text-gray-600 border-b border-x border-solid border-gray-800">write Y;</span>
  </div>

  <div class="flex flex-row mb-5 mx-2 lg:mx-20 mx-auto">
    <span class="mr-2 text-gray-300">Input: </span>
    <input bind:value={input} class="w-full mx-auto pl-1 border border-solid border-gray-800 bg-gray-300 text-gray-700">
  </div>

  <button on:click={submit} class="w-20 p-2 mx-auto bg-gray-300 text-gray-600 border border-solid border-gray-800 rounded">
    Run
  </button>

  {#if output.error || output.string} 
    <section class="flex flex-col w-full mx-auto">
      <pre class="overflow-scroll text-gray-300 border border-solid border-gray-400 my-5">
        <b>Output:</b>
        {#if output.error}
        {output.error === 'Bottom' ? 'Bottom' : `Error: ${output.error}`}
        {:else}
        Tree Notation: {output.string}
        List Notation: {output.listString}
        Number: {output.number === -1 ? 'Not a number ': output.number}
        {/if}      
      </pre>
      <button on:click={() => showTree = !showTree} class="w-fit p-2 mx-auto mb-5 bg-gray-300 text-gray-600 border border-solid border-gray-800 rounded">
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
  <h1 class="mb-2 text-center text-2xl text-gray-200">Syntax</h1>
  <hr/>
  <CodeBlock>
  <svelte:fragment slot="title">Expressions:</svelte:fragment>>
  <svelte:fragment slot="code">
  // constants
  > nil
  > 0
  > 1
  > 14
  <hr/>
  // variables
  > X
  > Y
  > Z
  > customVar
  <hr/>
  > tl {'<expr>'}
  > hd {'<expr>'}
  > hd tl {'<expr>\n'}
  <hr/>
  > cons {'<expr>'}, {'<expr>'}
  // note: ',' seperates expressions
  <hr/>
  > list {'<expr>'}, {'<expr>'}, {'<expr>'}
  // note: ',' seperates expressions
  // note: cannot use cons with list
  </svelte:fragment>
  </CodeBlock>
  <CodeBlock>
  <svelte:fragment slot="title">
  Assign:
  </svelte:fragment>
  <svelte:fragment slot="code">
  > Y := 0; // constant
  <hr/>
  > Y := X; // variable
  <hr/>
  > Y := {'<expr>'}; // expression
  </svelte:fragment>
  </CodeBlock>
  <CodeBlock>
  <svelte:fragment slot="title">
  If:
  </svelte:fragment>
  <svelte:fragment slot="code">
  > if {'<expr>'} then
    {'<command>'}  // note: no ';' here
  else
    {'<command>'}; // note: ';' here
  <hr/>
  > if {'<expr>'} then {'{\n'}
    {'\t<command>'}; // note: ';' here
    {'<command>'};
    {'<command>'}  // note: no ';' here
  {'}'} else {'{\n'}
    {'\t<command>'};
    {'<command>\n'}
  {' }'};
  </svelte:fragment>
  </CodeBlock>
  <CodeBlock>
  <svelte:fragment slot="title">
  While:
  </svelte:fragment>
  <svelte:fragment slot="code">
  > while {'<expr>'} do {'{\n'}
    {'\t<command>'};
    {'<command>'} // note: no ';' here
  {'}'};
  <hr/>
  > while {'<expr>'} do {'{\n\t<command>'}
  };
  // note: no ';' after command,
  // but after '}'
  </svelte:fragment>
  </CodeBlock>
</section>

<style>
  :global(svg) {
    margin: 0 auto;
    max-width: 100%;
    height: fit-content;
  }
</style>