<template>
  <div id="app">
    <router-view/>
    <svg xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="striped-red" class="pattern" x="5" y="10" width="18" height="20" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="8" height="200" style="stroke: none; fill: #3f88c5"></rect>
        </pattern>

        <pattern id="striped-purple" class="pattern" x="5" y="10" width="18" height="20" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="8" height="200" style="stroke: none; fill: #f22b29;"></rect>
        </pattern>

        <pattern id="striped-green" class="pattern" x="5" width="18" height="20" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="8" height="200" style="stroke: none; fill: #f49d37"></rect>
        </pattern>
      </defs>
    </svg>
  </div>
</template>

<script>
  export default {
    name: 'app'
  }
</script>

<style>
  html {
    background-color: #eee;
  }

  button {
    background: white;
  }

  .row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .column {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .flex-1 {
    flex: 1;
  }
</style>
