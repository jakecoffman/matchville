<template>
  <div>
    <div v-if="shape === 'n'" class="card" :class="classes">
      <div class="shape" v-for="a of amount" :key="a">
        <Bolt/>
      </div>
    </div>
    <div v-if="shape === 'd'" class="card" :class="classes">
      <div class="shape" v-for="a of amount" :key="a">
        <Cloud/>
      </div>
    </div>
    <div v-if="shape === 'p'" class="card" :class="classes">
      <div class="shape" v-for="a of amount" :key="a">
        <Drop/>
      </div>
    </div>
  </div>
</template>
<script>
  import Cloud from '@/components/Cloud'
  import Bolt from '@/components/Bolt'
  import Drop from '@/components/Drop'

  export default {
    components: {
      Cloud,
      Bolt,
      Drop
    },
    props: {
      shape: {
        type: String,
        required: true
      },
      pattern: {
        type: String,
        required: true
      },
      color: {
        type: String,
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      selected: {
        type: Array,
        required: false
      },
      index: {
        type: Number,
        required: false
      }
    },
    data() {
      return {}
    },
    computed: {
      classes() {
        const cs = {
          red: this.color === 'r',
          purple: this.color === 'p',
          green: this.color === 'g',

          hollow: this.pattern === 'h',
          solid: this.pattern === 's',
          striped: this.pattern === 'z'
        };
        if (this.selected) {
          cs.selected = this.selected.indexOf(this.index) > -1;
        }
        return cs;
      },
    },
    methods: {}
  }
</script>
<style type="scss">
  @keyframes select-pop {
    0% {
      -webkit-transform: scale(1);
      transform: scale(1);
    }
    50% {
      -webkit-transform: scale(0.95);
      transform: scale(0.95);
    }
    100% {
      -webkit-transform: scale(1.05);
      transform: scale(1.05);
    }
  }

  .card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    --width: 10vh;
    width: var(--width);
    height: calc(var(--width) * 1.5);
    background: #fff;
    border-radius: 6px;
    box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s ease-in-out;
    margin: 5px;
  }

  @media (min-width: 780px) {
    .card {
      --width: 100px;
      width: var(--width);
      height: calc(var(--width) * 1.5);
    }
  }

  .tiny > .card {
    --width: 30px;
    width: var(--width);
    height: calc(var(--width) * 1.5);
  }

  .card:nth-child(4n + 1) {
    clear: both;
  }

  .selected {
    box-shadow: 0px 0px 3px 2px #3498db;
    transform: scale(1.05);
    animation: 0.2s select-pop;
  }

  .shape {
    position: relative;
    width: 72%;
    height: 25%;
    margin-top: 3%;
    margin-bottom: 3%;
  }

  .shape svg {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .red path,
  .red polygon {
    stroke: #3f88c5;
    stroke-width: 8px;
  }

  .red.solid path,
  .red.solid polygon {
    fill: #3f88c5;
  }

  .red.striped path,
  .red.striped polygon {
    fill: url("#striped-red");
  }

  .red.hollow path,
  .red.hollow polygon {
    fill: transparent;
  }

  .green path,
  .green polygon {
    stroke: #f49d37;
    stroke-width: 8px;
  }

  .green.solid path,
  .green.solid polygon {
    fill: #f49d37;
  }

  .green.striped path,
  .green.striped polygon {
    fill: url("#striped-green");
  }

  .green.hollow path,
  .green.hollow polygon {
    fill: transparent;
  }

  .purple path,
  .purple polygon {
    stroke: #f22b29;
    stroke-width: 8px;
  }

  .purple.solid path,
  .purple.solid polygon {
    fill: #f22b29;
  }

  .purple.striped path,
  .purple.striped polygon {
    fill: url("#striped-purple");
  }

  .purple.hollow path,
  .purple.hollow polygon {
    fill: transparent;
  }

</style>
