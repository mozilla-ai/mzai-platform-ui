<template>
  <div>{{ prompt }}</div>
</template>

<script setup lang="ts">
defineProps<{
  prompt: string
}>()
</script>

<style scoped></style>
