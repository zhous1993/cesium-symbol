<script setup lang="ts">
import ZCesiumContainer from './example/ZCesiumContainer.vue';
</script>

<template>
  <div>
     <!-- <CesiumContainer /> -->
      <ZCesiumContainer />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
