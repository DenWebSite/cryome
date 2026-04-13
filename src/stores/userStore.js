import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // Состояние
  const user = ref(null)
  const initData = ref('')
  const initDataUnsafe = ref(null)
  const isTelegramReady = ref(false)

  const diagnosticResult = ref(null)
  const course = ref(null)

  // ✅ Инициализация при создании store - восстанавливаем из localStorage
  const savedCourse = localStorage.getItem('user_course')
  if (savedCourse) {
    course.value = savedCourse
    console.log('Course restored from localStorage:', savedCourse)
  }

  const savedDiagnosticResult = localStorage.getItem('diagnosticResult')
  if (savedDiagnosticResult) {
    diagnosticResult.value = JSON.parse(savedDiagnosticResult)
    console.log('Diagnostic result restored from localStorage')
  }

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

  // ✅ ДОБАВИТЬ: метод для установки курса с сохранением в localStorage
  const setCourse = (courseId) => {
    course.value = courseId
    if (courseId) {
      localStorage.setItem('user_course', courseId)
      console.log('Course saved to localStorage:', courseId)
    } else {
      localStorage.removeItem('user_course')
    }
  }

  // ✅ ДОБАВИТЬ: метод для очистки курса
  const clearCourse = () => {
    course.value = null
    localStorage.removeItem('user_course')
  }

  return {
    // Состояние
    user,
    initData,
    initDataUnsafe,
    isTelegramReady,

    diagnosticResult,
    course,
    
    // Методы диагностики
    setDiagnosticResult,
    getDiagnosticResult,
    
    // ✅ Методы курса (ДОБАВИТЬ)
    setCourse,
    clearCourse,

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