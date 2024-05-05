<template>
  <div style="display: flex; justify-content: center; gap: 8px;">
    <span>Game: {{gameId}}</span>
    <img v-if="!copied" src="@/assets/copy.png" style="cursor: pointer" @click="copyGame()">
    <img v-else src="@/assets/check.png">
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
