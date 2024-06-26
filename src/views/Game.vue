<template>
    <transition-group name="fade" mode="out-in">
        <div v-if="connected === 0" :key="connected" class="fullscreen">
            <div class="nice py-3">
                <h2>Connecting...</h2>
                <loader/>
            </div>
        </div>
        <div v-else-if="connected === 2" :key="connected" class="fullscreen">
            <div class="nice py-3">
                <h2>Disconnected</h2>
                <button class="small" @click="reload()">reload</button>
                to rejoin
            </div>
        </div>
        <div v-else class="hello" :key="connected">
            <div class="info">
                <div v-if="alert" class="row h-100">
                    <span>{{alert.Player.Name ? alert.Player.Name : `player ${alert.Player.Id}`}}:</span>
                    &nbsp;(<span v-if="alert.Score > 0">+</span>{{alert.Score}})
                    <span v-for="card of alert.Cards" :key="card.s+card.c+card.p+card.a">
                  <card class="animate-in tiny" :shape="card.s" :color="card.c" :pattern="card.p" :amount="card.a"/>
                </span>
                    {{alert.Words}}
                </div>
                <span v-else>Welcome to Matchtown!</span>
            </div>

            <!-- Main -->
            <div id="deal" v-if="playing">
                <button id="deal-btn" @click="nosets()" class="button-primary">no sets (deal more)</button>
            </div>
            <div class="main" v-if="playing">
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
            <div v-else class="scorecard">
                <div class="nice">
                    <h2>Matchtown</h2>
                    <p>Click
                        <span v-if="me.Ready">
                            <button @click="readyUp()" class="ready">Unready</button> to keep the game from starting.
                        </span>
                        <span v-else>
                            <button @click="readyUp()" class="notReady">Ready Up</button> to start playing.
                        </span>
                    </p>
                </div>
            </div>

            <div class="scorecard">
                <div class="nice">
                    <h3>Scorecard</h3>
                    <div id="players">
                        <table style="width: 100%;">
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
                    <CopyGame :game-id="gameId"></CopyGame>
                    <router-link tag="button" class="pink" :to="'/'+gameId+'/help'">how to play</router-link>
                    <div class="conjoined">
                        <input type="text" v-model="name" placeholder="Rename yourself" maxlength="9">
                        <button @click="rename(name)" class="action">rename</button>
                    </div>
                    <button @click="join('')" v-if="playing">start a new game</button>
                    <div class="conjoined">
                        <input type="number" v-model="input" placeholder="Join by Game ID" id="join">
                        <button @click="join(input)" class="action">join</button>
                    </div>
                </div>
            </div>
        </div>
    </transition-group>
</template>

<script>
    import Card from '@/components/Card'
    import Loader from '@/components/Loader'
    import CopyGame from "@/components/CopyGame.vue";

    export default {
        components: {
            CopyGame,
            Card,
            Loader
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
            onopen() {
                this.connected = 1;
                if (this.$route.params.id) {
                    this.join(this.$route.params.id);
                } else {
                    this.rejoin();
                }
            },
            onerror(e) {
                // eslint-disable-next-line no-console
                console.error(e);
                this.connected = 2;
            },
            onclose() {
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
                        // eslint-disable-next-line no-console
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

<style scoped>
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

    .h-100 {
        height: 100%;
    }

    footer {
        background: #4aa3df;
    }

    .hello {
        display: grid;
        grid-template-rows: 4rem 1fr;
        grid-template-columns: 1fr;
        grid-gap: 2rem;
    }

    #cards {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-gap: 0.5rem;
        padding-left: 1rem;
    }

    @media (min-width: 780px) {
        .hello {
            display: grid;
            grid-template-columns: 1fr 1fr;
        }

        .info {
            grid-column-start: 1;
            grid-column-end: 3;
        }
    }

    .info button {
        background: black;
        color: white;
        padding-left: 1rem;
        padding-right: 1rem;
        margin-left: 1rem;
        margin-right: 1rem;
    }

    .info {
        height: 4rem;
        padding: 1rem;

        background: #000000;
        color: white;
        z-index: 1000;

        display: flex;
        justify-content: center;
        align-items: center;
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

    .bounce-leave-to {
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
        position: absolute;
        transform: rotate(-90deg);
        max-width: 8rem;
        margin-right: -3rem;
        margin-top: 300px;
        z-index: 2;
    }

    .main {
        margin-top: 1rem;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
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
    }

    .conjoined > input {
        border-radius: 4px 0 0 4px;
        border-right: none;
        flex-grow: 1;
    }

    .conjoined > button {
        border-radius: 0 4px 4px 0;
        border-left: 1px solid #ccc;
    }

    .flip-list-move {
        transition: transform 1s;
    }

    .scorecard {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .nice {
        padding: 2rem;
        margin: 1rem;
        background: white;
        border-radius: 5px;
        box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.3);

        display: inline-block;
        align-content: center;
        align-items: center;
        text-align: center;
    }

    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s;
    }

    .fade-enter, .fade-leave-to {
        opacity: 0;
    }

    .fullscreen {
        position: absolute;
        top: 50px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

</style>
