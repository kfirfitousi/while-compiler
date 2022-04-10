<script lang="ts">
  export let value = '';
  export let minRows = 1;
	
  $: minHeight = `${1 + minRows * 1.25}em`;

  const keydown = (e: KeyboardEvent & {currentTarget: HTMLTextAreaElement}) => {
    if (e.key == 'Tab') {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.currentTarget;

      // set textarea value to: text before caret + tab + text after caret
      e.currentTarget.value = 
        e.currentTarget.value.substring(0, selectionStart)
        + '\t'
        + e.currentTarget.value.substring(selectionEnd);

      // put caret at right position again
      e.currentTarget.selectionStart = e.currentTarget.selectionEnd = selectionStart + 1;
    }
  }
</script>

<div class="container relative">
  <pre class="overflow-hidden leading-5 py-2" aria-hidden="true" style="min-height: {minHeight};">{value + '\n'}</pre>
  <textarea class="resize-none overflow-hidden absolute top-0 h-full w-full pl-4 pt-2 bg-gray-300 text-gray-700 leading-5 border-x border-solid border-gray-800" 
    bind:value
    on:keydown={keydown}
  />
</div>