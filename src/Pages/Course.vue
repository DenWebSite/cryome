<script setup>
// В любом компоненте
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp

        // Показываем кнопку "Назад"
        tg.BackButton.show()

        // Обработчик нажатия
        tg.BackButton.onClick(() => {
            router.back() // или router.push('/previous-page')
        })
    }
})

onUnmounted(() => {
    // Скрываем кнопку при уходе со страницы
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.BackButton.hide()
    }
})</script>

<template></template>