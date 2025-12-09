<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<template>
  <div class="tracker-title-container">
    <h1 class="green">{{ msg }}</h1>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

.tracker-title-container h1 {
  text-align: center;
}

@media (min-width: 1024px) {
  .tracker-title-container h1 {
    text-align: left;
  }
}
</style>