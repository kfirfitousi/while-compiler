<script>
  import { treeToString } from "$lib/while";

  let code = 'Y := X'
  let input = '(nil.nil)'
  let result

  const submit = async () => {
    const res = await fetch('/compile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code, input })
    })
    const data = await res.json();
    
    result = (res.ok) ? data.result : data.error
  }

  const keydown = (e) => {
    if (e.key == 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;

      // set textarea value to: text before caret + tab + text after caret
      e.target.value = e.target.value.substring(0, start) +
        "\t" + e.target.value.substring(end);

      // put caret at right position again
      e.target.selectionStart =
        e.target.selectionEnd = start + 1;
    }
  }
</script>

<h1>Welcome to SvelteKit</h1>
<hr/>
<br/>
<textarea bind:value={code} on:keydown={keydown}></textarea>
<input bind:value={input}>
<button on:click={submit}>Run</button>

<h2>{result}</h2>

<style>
	textarea { width: 600px; height: 200px; }
</style>