<script>
  import "../app.css";
</script>

<main class="container w-full lg:w-2/3 xl:w-1/2 mx-auto mt-8 px-12">
    <slot></slot>
</main>

<footer class="contatiner w-full lg:w-2/3 xl:w-1/2 mx-auto my-5 px-6">
  <div class="flex flex-col text-center text-gray-300">
    <div class="flex flex-row flex-wrap md:flex-nowrap justify-center items-center mx-auto my-2">
      <span class="mb-2 md:mr-3 md:mb-0 w-full md:w-auto">Built with</span>
      <img src="https://img.shields.io/badge/svelte-%23f1413d.svg?style=for-the-badge&logo=svelte&logoColor=white" alt="Svelte">
      <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="Typescript">
      <img src="https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel">
      <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS">
    </div>
    <span>
      Using the 
      <a class="underline text-blue-500" href="https://quickchart.io/documentation/graphviz-api" target="_blank">QuickChart Graphviz API</a>
      for tree visualization.
    </span>
    <span>
      Source code available on
      <a class="underline text-blue-500" href="https://github.com/kp2c/while-compiler" target="_blank">GitHub</a>.
    </span>
  </div>
</footer>