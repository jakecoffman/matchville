<template>
  <div style="display: flex; justify-content: center; gap: 64px;">
    <span>Game: {{gameId}}</span>
    <img v-if="!copied" src="@/assets/copy.svg" style="width: 32px; height: 32px; cursor: pointer" @click="copyGame()">
    <span v-else style="color: green">✔</span>
  </div>
</template>
<script>

// This component is a copy icon that if you click it, copies the GameID parameter into the clipboard.
// It gives visual feedback by changing the icon to a checkmark when the copy is successful.

export default {
  name: 'CopyGame',
  props: {
    gameId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      copied: false
    }
  },
  methods: {
    async copyGame() {
      let url = `${window.location.origin}/#/${this.gameId}`
      await navigator.clipboard.writeText(url)
      this.copied = true
      setTimeout(() => {
        this.copied = false
      }, 2000)
    }
  }
}
</script>
