<template>
  <div class="hello">
    <div v-if="alert" class="info row">
      <span v-if="you === alert.Player">you:</span>
      <span v-else>player {{alert.Player}}:</span>
      &nbsp;(<span v-if="alert.Score > 0">+</span>{{alert.Score}})
      <span v-for="card of alert.Cards" :key="card.s+card.c+card.p+card.a">
        <card class="animate-in tiny"
                  :shape="card.s"
                  :color="card.c"
                  :pattern="card.p"
                  :amount="card.a"/>
      </span>
      {{alert.Words}}
    </div>
    <div v-else class="info row">
      Welcome to Set!
    </div>
    <div v-if="connected===0" class="alert">Connecting</div>
    <div v-if="connected===2" class="alert">Disconnected, reload to rejoin</div>

    <div class="main">
      <div class="column" id="deal">
        <button id="deal-btn" @click="nosets()" class="button-primary">no sets (deal more)</button>
      </div>
      <transition-group name="bounce" id="cards" mode="out-in" tag="div">
        <div v-for="(card, index) of cards" :key="card.s+card.c+card.p+card.a"
             @click="selectHandler(index)"
             @touchstart="touchStart()"
             @touchmove="touchMove($event)"
             @touchend="touchEnd(index, $event)">
          <card class="animate-in"
            :shape="card.s"
            :color="card.c"
            :pattern="card.p"
            :amount="card.a"
            :selected="selected"
            :index="index"/>
        </div>
      </transition-group>
    </div>
    <hr/>
    <div class="column" id="more">
      <div id="players">
        <table>
          <thead>
          <tr>
            <th>Player</th>
            <th>Score</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="player of players" :key="player.Id">
            <td>{{player.Id}}
              <span class="aside" v-if="player.Connected === false">(offline)</span>
              <span class="aside" v-if="you === player.Id">(you)</span>
            </td>
            <td>{{player.Score}}</td>
          </tr>
          </tbody>
        </table>
      </div>
      <p>Game ID: {{gameId}}</p>
      <button @click="join('')">start a new game</button>
      <label for="join">Join a game</label>
      <div>
        <input type="number" v-model="input" placeholder="Game ID" id="join">
        <button @click="join(input)">join</button>
      </div>
      <router-link tag="button" class="pink" :to="'/'+gameId+'/help'">how to play</router-link>
    </div>

  </div>
</template>

<script>
  import Card from '@/components/Card'

  export default {
    components: {
      Card
    },
    data() {
      return {
        ws: null,
        connected: 0,

        cards: [],
        gameId: '',
        players: [],
        version: -1,
        you: 0,
        selected: [], // selected cards (local only),

        input: '',
        alert: null,
        help: false,

        start: null,
        handling: false
      }
    },
    created() {
      let url;
      if (location.protocol === 'https:') {
        url = 'wss://';
      } else {
        url = 'ws://';
      }
      url += location.host + location.pathname + (location.pathname.endsWith('/') ? 'ws' : '/ws');
      this.ws = new WebSocket(url);

      this.ws.onopen = this.onopen.bind(this);
      this.ws.onerror = this.onerror.bind(this);
      this.ws.onclose = this.onclose.bind(this);
      this.ws.onmessage = this.onmessage.bind(this);
    },
    methods: {
      onopen(e) {
        this.connected = 1;
        if (this.$route.params.id) {
          this.join(this.$route.params.id);
        } else {
          this.join('');
        }
      },
      onerror(e) {
        console.error(e);
        this.connected = 2;
      },
      onclose(e) {
        this.connected = 2;
      },
      onmessage(e) {
        let data = JSON.parse(e.data);
        switch (data.Type) {
          case "cookie":
            document.cookie = data.Cookie;
            break;
          case 'meta':
            this.gameId = data.GameId;
            if (this.$route.params.id !== this.gameId) {
              this.$router.push({path: this.gameId});
            }
            this.version = data.Version;
            this.players = data.Players;
            this.you = data.You;
            break;
          case 'all':
            this.cards = [];
          // fallthrough
          case 'update':
            this.selected = [];
            for (let update of data.Updates) {
              if (this.cards.length <= update.Location) {
                this.cards.push({})
              }
              this.cards.splice(update.Location, 1, update.Card);
            }
            this.version = data.Version;
            this.players = data.Players;
            break;
          case 'cheat':
            this.cheats = data.Sets;
            break;
          case 'play':
            this.alert = data;
            break;
          default:
            console.log("unknown type", data);
        }
      },
      join(id) {
        this.ws.send(JSON.stringify({Type: "join", Data: id}));
      },
      selectHandler(location) {
        if (this.handling) {
          return;
        }
        const index = this.selected.indexOf(location);
        if (index >= 0) {
          this.selected.splice(index, 1);
        } else {
          this.selected.push(location);
        }
        if (this.selected.length >= 3) {
          this.ws.send(JSON.stringify({Type: "play", Data: this.selected, Version: this.version}));
          this.selected = [];
        }
      },
      nosets() {
        this.ws.send(JSON.stringify({Type: 'nosets', Version: this.version}))
      },
      touchStart() {
        this.start = new Date().getTime();
        this.handling = true;
      },
      touchMove(e) {
        if (new Date().getTime() - this.start < 200) {
          e.preventDefault();
        } else {
          this.handling = false;
        }
      },
      touchEnd(location, e) {
        if (this.handling && new Date().getTime() - this.start < 500) {
          this.handling = false;
          e.preventDefault();
          this.selectHandler(location);
        }
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  * {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  html {
    height: 100%;
  }

  body {
    height: 100%;
    margin: auto;
    font-family: Verdana, sans-serif;
  }

  main {
    height: 100%;
  }

  footer {
    background: #4aa3df;
  }

  .hello {
    padding-top: 55px;
  }

  #cards {
    display: flex;
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
    margin: auto;
    min-height: 100%;
  }

  @media (max-width: 450px) {
    #cards {
      width: 300px;
    }
  }

  @media (min-width: 451px) and (max-width: 599px){
    #cards {
      width: 350px;
    }
  }

  @media (min-width: 600px) {
    #cards {
      width: 500px;
    }
  }

  #more {
    margin: 0;
    padding: 0;
  }

  .alert {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #303030;
    color: white;
    padding: 10px 40px 10px 20px;
    z-index: 1000;
  }

  .info {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #303030;
    color: white;
    height: 55px;
    z-index: 1000;
  }

  .tiny {
    --width: 30px;
    width: var(--width);
    height: calc(var(--width) * 1.5);
  }

  .bounce-enter-active {
    animation: bounceIn 0.75s;
  }

  .bounce-move {
    transition: transform 0.5s;
  }

  .bounce-leave-active {
    position: absolute;
  }

  .bounce-leave-to
    /* .list-complete-leave-active below version 2.1.8 */ {
    opacity: 0;
    transform: translateY(30px);
  }

  @keyframes bounceIn {
    0%, 15%, 30%, 45%, 80%, 100% {
      -webkit-transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
      transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    }
    0% {
      -webkit-transform: scale3d(0.2, 0.2, 0.2);
      transform: scale3d(0.2, 0.2, 0.2);
    }
    15% {
      -webkit-transform: scale3d(1.37, 1.37, 1.37);
      transform: scale3d(1.37, 1.37, 1.37);
    }
    30% {
      -webkit-transform: scale3d(0.85, 0.85, 0.85);
      transform: scale3d(0.85, 0.85, 0.85);
    }
    45% {
      -webkit-transform: scale3d(1.04, 1.04, 1.04);
      transform: scale3d(1.04, 1.04, 1.04);
    }
    80% {
      -webkit-transform: scale3d(0.97, 0.97, 0.97);
      transform: scale3d(0.97, 0.97, 0.97);
    }
    100% {
      -webkit-transform: scale3d(1, 1, 1);
      transform: scale3d(1, 1, 1);
    }
  }

  .animate-in {
    -webkit-animation: bounceIn 1s both linear;
    animation: bounceIn 1s both linear;
  }

  .aside {
    font-style: italic;
  }

  .pink {
    background-color: pink;
    color: white;
  }

  #deal {
    transform: rotate(-90deg);
    max-width: 8rem;
    margin-right: -3rem;
  }

  .main {
    display: flex;
    flex-direction: row;
  }
</style>
