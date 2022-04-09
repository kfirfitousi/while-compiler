<script lang="ts">
	export let value = '';
	export let minRows = 1;
	export let maxRows = 50;
	
	$: minHeight = `${1 + minRows * 1.25}em`;
	$: maxHeight = maxRows ? `${1 + maxRows * 1.25}em` : `auto`;

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
<div class="container relative">
	<pre class="leading-5 py-2" aria-hidden="true" style="min-height: {minHeight}; max-height: {maxHeight}">{value + '\n'}</pre>
	<textarea class="absolute top-0 h-full w-full pl-4 pt-2 border border-solid border-gray-300 bg-gray-200 leading-5" 
    bind:value
    on:keydown={keydown}
  />
</div>

<style>
	pre, textarea {
		overflow: hidden;
	}
	
	textarea {
		resize: none;
	}
</style>