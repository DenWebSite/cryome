import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // Состояние
  const user = ref(null)
  const initData = ref('')
  const initDataUnsafe = ref(null)
  const isTelegramReady = ref(false)

  const diagnosticResult = ref(null)

  const initTelegramUser = () => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp

      initDataUnsafe.value = tg.initDataUnsafe

      if (tg.initDataUnsafe.user) {
        user.value = tg.initDataUnsafe.user
        console.log('User data:', user.value)
      }

      tg.ready()
      tg.expand()

      isTelegramReady.value = true
    } else {
      if (import.meta.env.DEV) {
        user.value = {
          id: 999999,
          first_name: 'Тестовый',
          last_name: 'Пользователь',
          username: 'testuser',
          language_code: 'ru'
        }
      }
    }
  }

  // Геттеры (computed)
  const userId = () => user.value?.id
  const userFirstName = () => user.value?.first_name
  const userLastName = () => user.value?.last_name
  const userUsername = () => user.value?.username
  const userLanguage = () => user.value?.language_code
  const isPremium = () => user.value?.is_premium || false
  const fullName = () => {
    if (!user.value) return 'Гость'
    return `${user.value.first_name || ''} ${user.value.last_name || ''}`.trim()
  }

  const setDiagnosticResult = (result) => {
    diagnosticResult.value = result
    localStorage.setItem('diagnosticResult', JSON.stringify(result))
  }

  const getDiagnosticResult = () => {
    return diagnosticResult.value || JSON.parse(localStorage.getItem('diagnosticResult') || 'null')
  }


  return {
    // Состояние
    user,
    initData,
    initDataUnsafe,
    isTelegramReady,

    diagnosticResult,
    setDiagnosticResult,
    getDiagnosticResult,

    // Действия
    initTelegramUser,

    // Геттеры
    userId,
    userFirstName,
    userLastName,
    userUsername,
    userLanguage,
    isPremium,
    fullName
  }
})