<template>
  <div id="app">
    <router-view/>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" style="display: none">
      <defs>
        <pattern id="striped-red" class="pattern" x="10" y="10" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="10" height="200" style="stroke: none; fill: #E74C3C"></rect>
        </pattern>

        <pattern id="striped-purple" class="pattern" x="10" y="10" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="10" height="200" style="stroke: none;" fill="#9B59B6"></rect>
        </pattern>

        <pattern id="striped-green" class="pattern" x="10" y="10" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="10" height="200" style="stroke: none; fill: #2ECC71"></rect>
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
