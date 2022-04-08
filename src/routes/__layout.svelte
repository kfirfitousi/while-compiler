<script>
  import "../app.css";
  import { navigating } from '$app/stores'
</script>

<main class="container sm:w-screen lg:w-2/3 mx-auto mt-8 px-12">
  {#if $navigating}
    <p class="text-center text-gray-800 dark:text-gray-200">Loading...</p>
  {:else}
    <slot></slot>
  {/if}
</main>
