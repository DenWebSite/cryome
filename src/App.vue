<script setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useUserStore } from './stores/userStore'

const userStore = useUserStore()

onMounted(() => {
  userStore.initTelegramUser()
})
</script>

<template>
  <RouterView />
</template>

<style scoped></style>