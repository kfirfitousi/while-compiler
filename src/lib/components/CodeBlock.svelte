<div class="flex flex-col md:flex-row items-stretch justify-center my-5 w-full text-xs md:text-lg">
  <h2 class="text-center text-sm w-full md:w-32 bg-gray-200 mx-0 my-0 py-3 md:pt-8">
  <slot name="title"></slot>  
  </h2>
  <pre class="bg-gray-500 text-gray-200 w-full mx-0 overflow-scroll">
  <slot name="code"></slot>
  </pre>
</div>