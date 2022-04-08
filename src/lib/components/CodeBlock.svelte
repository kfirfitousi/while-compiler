<div class="my-5 flex flex-col md:flex-row items-stretch justify-center w-full">
  <h2 class="text-center text-xs w-full md:w-32 bg-gray-200 mx-0 my-0 py-3 md:pt-6">
    <slot name="title"></slot>  
  </h2>
  <pre class="bg-gray-500 text-gray-100 w-full mx-0">
    <slot name="code"></slot>
  </pre>
</div>