<template>
  <div class="card small" :class="classes">
    <div v-if="shape === 'n'">
      <div class="shape" v-for="a of amount" :key="a">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 106.058">
          <path
            d="M81.442,14.792c13.791,1.487,17.955,2.853,29.088,6.921c17.255,6.307,32.98,3.611,48.464-4.519c4.869-2.557,9.379-5.785,14.096-8.64c11.231-6.794,21.987-3.746,27.416,8.255c7.255,16.35,5.223,31.92-2.491,47.142c-13.492,26.623-38.203,34.367-64.534,29.43c-14.679-2.97-28.883-8.259-43.537-11.403c-17.457-3.745-33.689,.502-48.567,10.238c-3.548,2.321-7.216,4.498-10.981,6.443c-11.57,5.98-20.215,2.23-23.625-10.337C1.708,69.282,7.989,53.525,19.427,39.053C33.758,20.92,52.818,12.638,81.442,14.792z"></path>
        </svg>
      </div>
    </div>
    <div v-if="shape === 'd'">
      <div class="shape" v-for="a of amount" :key="a">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 223.621 104.493">
          <polygon points="211.811,52.247 111.811,98.974 11.811,52.247 111.811,5.519"></polygon>
        </svg>
      </div>
    </div>
    <div v-if="shape === 'p'">
      <div class="shape" v-for="a of amount" :key="a">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 101.429">
          <path
            d="M159.286,96.429c25.247,0,45.714-20.467,45.714-45.714S184.533,5,159.286,5H50.714C25.467,5,5,25.467,5,50.714s20.467,45.714,45.714,45.714H159.286z"></path>
        </svg>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
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
    --width: 70px;
    width: var(--width);
    height: calc(var(--width) * 1.5);
    background: #fff;
    border-radius: 6px;
    -webkit-box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.3);
    box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.3);
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    cursor: pointer;
    -webkit-transition: -webkit-transform 0.2s ease-in-out;
    transition: transform 0.2s ease-in-out;
    margin: 5px;
  }

  .card:nth-child(4n + 1) {
    clear: both;
  }

  .selected {
    -webkit-box-shadow: 0px 0px 3px 2px #3498db;
    box-shadow: 0px 0px 3px 2px #3498db;
    -webkit-transform: scale(1.05);
    -ms-transform: scale(1.05);
    transform: scale(1.05);
    animation: 0.2s select-pop;
  }

  .shape {
    position: relative;
    -webkit-flex: 0 0 auto;
    -ms-flex: 0 0 auto;
    flex: 0 0 auto;
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
    stroke: #e74c3c;
    stroke-width: 8px;
  }

  .red.solid path,
  .red.solid polygon {
    fill: #e74c3c;
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
    stroke: #2ecc71;
    stroke-width: 8px;
  }

  .green.solid path,
  .green.solid polygon {
    fill: #2ecc71;
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
    stroke: #9b59b6;
    stroke-width: 8px;
  }

  .purple.solid path,
  .purple.solid polygon {
    fill: #9b59b6;
  }

  .purple.striped path,
  .purple.striped polygon {
    fill: url("#striped-purple");
  }

  .purple.hollow path,
  .purple.hollow polygon {
    fill: transparent;
  }

  @media (max-width: 600px) {
    .card {
      --width: 70px;
    }
  }

  @media (min-width: 600px) {
    .card {
      --width: 100px;
    }
  }

</style>
