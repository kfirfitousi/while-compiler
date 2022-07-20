<script lang="ts">
  import type { CompileOutput } from 'src/types'
  import { fetchImage } from '$lib/graphviz'
  import CodeBlock from '$lib/components/CodeBlock.svelte'
  import Textarea from '$lib/components/Textarea.svelte'

  let code = `Y := 0;
while X do {
    Y := cons nil, Y;
    X := tl X;
}`
  let input = ''
  let output: CompileOutput = {}
  let showTree = false
  let showPy = false

  const submit = async () => {
    if (input.trim() === '') input = 'nil'

    const res = await fetch('/compile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code, input })
    })
    const data: CompileOutput = await res.json();
    
    if (!res.ok) {
      output.error = data.error
      output.pyProg = data.pyProg
      return
    }
    
    output = data
    output.image = '<p class="text-center text-gray-300">Loading...</p>'
    
    try {
      output.image = await fetchImage(output.raw)
    }
    catch (e) {
      console.error(e)
    }
  }

  function download(filename: string, text: string) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
</script>

<h1 class="mb-4 text-center text-4xl text-gray-200">
  WHILE Compiler
</h1>
<hr/>

<section class="flex flex-col w-full mx-auto my-5">
  <div class="flex flex-col mb-5 mx-2 lg:mx-20 mx-auto">
    <span class="pl-1 bg-gray-300 text-gray-600 border-t border-x border-solid border-gray-800 rounded-t">read X;</span>
    <Textarea  
      bind:value={code}
      minRows={5}
    />  
    <span class="pl-1 bg-gray-300 text-gray-600 border-b border-x border-solid border-gray-800 rounded-b">write Y;</span>
  </div>

  <div class="flex flex-row mb-5 mx-2 lg:mx-20 mx-auto">
    <span class="mr-2 text-gray-300">Input: </span>
    <input
      class="w-full mx-auto pl-1 border border-solid border-gray-800 bg-gray-300 text-gray-700 rounded"
      placeholder="Tree Notation or Number (e.g. 7, nil, (nil.nil))" 
      bind:value={input} 
      on:keydown={(e) => { if (e.key === 'Enter') submit() }} 
    >
  </div>
  
  <button on:click={submit} class="w-20 p-2 mx-auto bg-gray-300 text-gray-600 border border-solid border-gray-800 rounded">
    Run
  </button>

  {#if output.string || output.error} 
    <section class="flex flex-col w-full mx-auto">
      <div class="text-gray-300 border border-solid border-gray-400 my-5 p-10 overflow-scroll whitespace-nowrap">
        <b>Output:</b><br/>
        {#if output.error}
        {output.error === 'Bottom' ? 'Bottom' : `Error: ${output.error}`}
        {:else}
        Tree Notation: {output.string}<br/>
        List Notation: {output.listString}<br/>
        Number: {output.number === -1 ? 'Not a number ': output.number}<br/>
        <button on:click={() => showTree = !showTree} class="w-fit px-2 mx-auto mt-2 mb-4 bg-gray-300 text-gray-600 border border-solid border-gray-800 rounded">
          {showTree ? 'Hide' : 'Show'} Output Tree
        </button>
        {#if showTree && output.image}
        <div class="w-full mx-auto">
          {@html output.image}
        </div>
        {/if}
        {/if}
      </div>

      {#if output.pyProg}
      <div class="pl-10 overflow-scroll text-gray-300 border border-solid border-gray-400 mb-5 p-10">
        <b>Python Program:</b>
        <button
          class="w-fit px-2 border border-solid border border-gray-800 rounded bg-gray-300 text-gray-600"
          on:click={() => showPy = !showPy}
        >
          {showPy ? 'Hide' : 'Show'}
        </button>
        <button
          class="w-fit px-2 border border-solid border border-gray-800 rounded bg-gray-300 text-gray-600" 
          on:click={() => download('prog.py', output.pyProg.trim())}
        >
          Download
        </button>
        {#if showPy}
        <pre>{output.pyProg}</pre>
        {/if}
      </div>
      {/if}
    </section>
  {/if}

</section>

<section class="flex flex-col w-full mx-auto">
  <h1 class="mb-2 text-center text-2xl text-gray-200">Syntax</h1>
  <hr/>
  <CodeBlock>
  <svelte:fragment slot="title">
    Expressions
  </svelte:fragment>
  <svelte:fragment slot="code">
  <b>Constants</b>
  > nil
  > 0
  > 1
  > 14
  <hr/>
  {'\n '}
  <b>Variables</b>
  > X
  > Y
  > Z
  > customVar
  <hr/>
  > <b>tl</b> {'<expr>'}
  > <b>hd</b> {'<expr>'}
  > <b>hd tl</b> {'<expr>'}
  > <b>tl hd tl tl</b> {'<expr>\n'}
  <hr/>
  > <b>cons</b> {'<expr>'}, {'<expr>'}
  > <b>cons</b> {'<expr>'}, <b>cons</b> {'<expr>'}, {'<expr>'}
  // note: ',' seperates expressions
  <hr/>
  > <b>list</b> {'<expr>'}, {'<expr>'}, {'<expr>'}, {'<expr>'}
  // note: ',' seperates expressions
  // note: cannot use cons with list
  </svelte:fragment>
  </CodeBlock>
  <CodeBlock>
  <svelte:fragment slot="title">
  Assign
  </svelte:fragment>
  <svelte:fragment slot="code">
  <b>Constant</b>
  > Y := nil;
  > X := 10;
  <hr/>
  {'\n '}
  <b>Variable</b>
  > Y := X;
  > A := B; 
  <hr/>
  {'\n '}
  <b>Expression</b>
  > Y := {'<expr>'};
  </svelte:fragment>
  </CodeBlock>
  <CodeBlock>
  <svelte:fragment slot="title">
  If
  </svelte:fragment>
  <svelte:fragment slot="code">
  <b>One command</b>
  > <b>if</b> {'<expr>'} <b>then</b>
    {'\n\t<command>'}  // note: no ';' here
  <b>else</b>
    {'\n\t<command>'};
  <hr/>
  {'\n '}
  <b>Multiple commands</b>
  > <b>if</b> {'<expr>'} <b>then</b> {'{\n'}
    {'\t<command>'};
    {'<command>'};
    {'<command>'};
  {'}'} <b>else</b> {'{\n'}
    {'\t<command>'};
    {'<command>;\n'}
  {' }'}; 
  </svelte:fragment>
  </CodeBlock>
  <CodeBlock>
  <svelte:fragment slot="title">
  While
  </svelte:fragment>
  <svelte:fragment slot="code">
  <b>One command</b>
  > <b>while</b> {'<expr>'} <b>do</b> {'{\n\t<command>;'}
  };
  <hr/>
  {'\n '}
  <b>Multiple commands</b>
  > <b>while</b> {'<expr>'} <b>do</b> {'{\n'}
    {'\t<command>'};
    {'<command>'};
  {'}'};
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