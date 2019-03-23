import Vue from 'vue'
import Router from 'vue-router'
import Game from './views/Game'
import Help from './views/Help'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'main',
      component: Game
    },
    {
      path: '/:id',
      name: 'game',
      component: Game
    },
    {
      path: '/:id/help',
      name: 'help',
      component: Help
    }
  ],
  scrollBehavior () {
    return { x: 0, y: 0 }
  }
})
