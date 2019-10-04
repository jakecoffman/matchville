<template>
  <div class="hello">
    <div v-if="alert" class="info row">
      <span v-if="you === alert.Player">you:</span>
      <span v-else>{{players[alert.Player] ? players[alert.Player].Name : `player ${alert.Player}`}}:</span>
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
      Welcome to Matchville!
    </div>
    <div class="alert" v-if="connected !== 1">
      <div v-if="connected===0">Connecting</div>
      <div v-if="connected===2">Disconnected <button @click="reload()">reload</button> to rejoin</div>
    </div>
    <div class="main" v-if="playing">
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

    <div class="column" id="more">
      <div v-if="!playing" class="column">
        <br/>
        <button @click="readyUp()" :class="{ready: me.Ready, notReady: !me.Ready}">
          <span v-if="me.Ready">Unready</span>
          <span v-else>Ready up</span>
        </button>
      </div>
      <div id="players">
        <table>
          <thead>
          <tr>
            <th>Player</th>
            <th>Score</th>
          </tr>
          </thead>
          <transition-group name="flip-list" tag="tbody">
            <tr v-for="player of sortedPlayers" :key="player.Id">
              <td>{{player.Name || player.Id}}
                <span class="aside" v-if="!player.Connected">(offline)</span>
                <span class="aside" v-if="you === player.Id">(you) </span>
                <span class="aside" v-if="!player.Ready">Not Ready</span>
              </td>
              <td>{{player.Score}}</td>
            </tr>
          </transition-group>
        </table>
      </div>
      <p>Game ID: {{gameId}}</p>
      <router-link tag="button" class="pink" :to="'/'+gameId+'/help'">how to play</router-link>
      <div class="conjoined">
        <input type="text" v-model="name" placeholder="Rename yourself" maxlength="9">
        <button @click="rename(name)">rename</button>
      </div>
      <button @click="join('')">start a new game</button>
      <div class="conjoined">
        <input type="number" v-model="input" placeholder="Join by Game ID" id="join">
        <button @click="join(input)">join</button>
      </div>
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

        playing: false,
        cards: [],
        gameId: '',
        players: {},
        version: -1,
        you: 0,
        selected: [], // selected cards (local only),

        input: '',
        name: '',
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
    computed: {
      me() {
        return this.players[this.you] || {Ready: false}
      },
      sortedPlayers() {
        return Object.values(this.players).sort((a, b) => b.Score - a.Score)
      }
    },
    methods: {
      onopen(e) {
        this.connected = 1;
        if (this.$route.params.id) {
          this.join(this.$route.params.id);
        } else {
          this.rejoin();
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
            this.playing = data.Playing;
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
        this.$forceUpdate()
      },
      join(id) {
        this.ws.send(JSON.stringify({Type: "join", Data: id}));
      },
      rejoin() {
        this.ws.send(JSON.stringify({Type: "rejoin"}));
      },
      readyUp() {
        this.ws.send(JSON.stringify({Type: "ready", Data: !this.me.Ready}));
      },
      rename() {
        this.ws.send(JSON.stringify({Type: "rename", Data: this.name}));
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
      },
      reload() {
        window.location.reload(true)
      }
    },
  }
</script>

<style lang="scss" scoped>
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
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-gap: 0.5rem;
  }

  @media(min-width: 700px) {
    #cards {
      grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
    }
  }

  #more {
    margin: 0;
    padding: 1rem 0 0;
    z-index: 1000;
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
    display: flex;
    justify-content: center;
    button {
      color: white;
    }
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
    background-color: #edefff;
  }

  #deal {
    transform: rotate(-90deg);
    max-width: 8rem;
    margin-right: -3rem;
  }

  .main {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
  }

  .ready {
    background: red;
  }
  .notReady {
    background: #b2ffb2;
  }

  .conjoined {
    display: flex;
    flex-direction: row;

    input {
      border-radius: 4px 0 0 4px;
      border-right: none;
    }

    button {
      border-radius: 0 4px 4px 0;
    }
  }

  .flip-list-move {
    transition: transform 1s;
  }
</style>
