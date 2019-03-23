<template>
  <div class="help column">
    <h2>Help</h2>
    <p>A SET is three cards where each feature, when looked at individually, is either all the <b>same</b> OR
      all <b>different</b>. Each card contains four features: color (red, purple or green), shape (oval,
      squiggle or diamond), number (one, two or three) and shading (solid, striped or outlined).</p>
    <p>Examples:</p>
    <div class="row">
      <card shape="n" color="r" pattern="s" :amount="1"/>
      <card shape="p" color="r" pattern="s" :amount="1"/>
      <card shape="d" color="r" pattern="s" :amount="1"/>
    </div>
    <p>This is a set because color, pattern, and amount are <b>all same</b> and shapes are <b>all different</b>.</p>
    <div class="row">
      <card shape="p" color="p" pattern="s" :amount="1"/>
      <card shape="p" color="p" pattern="h" :amount="2"/>
      <card shape="p" color="p" pattern="z" :amount="3"/>
    </div>
    <p>This is a set because color and shape are <b>all same</b> and patern and amount are <b>all different</b>.</p>
    <div class="row">
      <card shape="n" color="r" pattern="h" :amount="1"/>
      <card shape="d" color="g" pattern="s" :amount="2"/>
      <card shape="p" color="p" pattern="z" :amount="3"/>
    </div>
    <p>This is a set because shape, color, pattern, and amount are <b>all different</b>.</p>
    <br/>
    <h3>No Sets?</h3>
    <p>When you think there are no sets on the board, press the "deal more" button to deal more cards.</p>
    <button @click="$router.go(-1)">OK</button>
  </div>
</template>
<script>
  import Card from '@/components/Card'

  export default {
    components: {
      Card
    }
  }
</script>
<style type="scss">
  .help {
    padding: 2em;
  }
  #striped-red rect {
    fill: #e74c3c;
  }
  #striped-green rect {
    fill: #2ecc71;
  }
  #striped-purple rect {
    fill: #9b59b6;
  }
</style>
