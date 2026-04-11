<script setup>
import { ref, computed, onMounted } from 'vue'
import Button from './Button.vue'
import { useUserStore } from '.././stores/userStore'
import router from '@/router'

const userStore = useUserStore()

const questions = ref([])
const loading = ref(true)
const error = ref(null)
const currentIndex = ref(0)
const answers = ref({})

// Выбранный ответ для одиночного выбора (radio)
const selectedAnswer = computed({
    get: () => answers.value[currentQuestion.value?.id] || null,
    set: (value) => {
        if (currentQuestion.value) {
            answers.value[currentQuestion.value.id] = value
            localStorage.setItem('testAnswers', JSON.stringify(answers.value))
        }
    }
})

// Выбранные ответы для множественного выбора (checkbox)
const selectedAnswersMultiple = computed({
    get: () => {
        const currentAnswer = answers.value[currentQuestion.value?.id]
        // Если это массив - возвращаем его, иначе пустой массив
        return Array.isArray(currentAnswer) ? currentAnswer : []
    },
    set: (value) => {
        if (currentQuestion.value) {
            answers.value[currentQuestion.value.id] = value
            localStorage.setItem('testAnswers', JSON.stringify(answers.value))
        }
    }
})

// Проверка, выбран ли хотя бы один ответ
const isAnswerSelected = computed(() => {
    if (!currentQuestion.value) return false

    if (currentQuestion.value.is_multiple) {
        // Для множественного выбора - проверяем, что массив не пустой
        const answer = answers.value[currentQuestion.value.id]
        return Array.isArray(answer) && answer.length > 0
    } else {
        // Для одиночного выбора - проверяем, что значение не null
        return answers.value[currentQuestion.value.id] !== null &&
            answers.value[currentQuestion.value.id] !== undefined
    }
})

// Текущий вопрос
const currentQuestion = computed(() => {
    if (questions.value.length > 0 && currentIndex.value < questions.value.length) {
        return questions.value[currentIndex.value]
    }
    return null
})

// Загрузка вопросов
const fetchQuestions = async () => {
    loading.value = true
    error.value = null

    try {
        const response = await fetch('http://127.0.0.1:8080/api/diagnostic/questions')

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        questions.value = data
        console.log(questions)

        // Восстанавливаем сохранённые ответы
        const savedAnswers = localStorage.getItem('testAnswers')
        if (savedAnswers) {
            answers.value = JSON.parse(savedAnswers)
        }

        // Находим последний отвеченный вопрос
        const lastAnsweredIndex = questions.value.findIndex(q => {
            const answer = answers.value[q.id]
            if (q.is_multiple) {
                return !answer || answer.length === 0
            } else {
                return !answer
            }
        })

        if (lastAnsweredIndex !== -1) {
            currentIndex.value = lastAnsweredIndex
        } else if (Object.keys(answers.value).length === questions.value.length) {
            currentIndex.value = questions.value.length - 1
        }

    } catch (err) {
        error.value = err.message
        console.error('Error fetching questions:', err)
    } finally {
        loading.value = false
    }
}

// Навигация
const nextQuestion = () => {
    if (isAnswerSelected.value && currentIndex.value < questions.value.length - 1) {
        currentIndex.value++
    } else if (isAnswerSelected.value && currentIndex.value === questions.value.length - 1) {
        console.log('Тест завершён! Ответы:', answers.value)
        submitResults()
    }
}

const prevQuestion = () => {
    if (currentIndex.value > 0) {
        currentIndex.value--
    }
}

const submitResults = async () => {
    try {
        const formattedAnswers = []
        
        // Проходим по всем ответам пользователя
        for (const [questionId, answerValue] of Object.entries(answers.value)) {
            const question = questions.value.find(q => q.id === parseInt(questionId))
            if (!question) continue
            
            // Для множественных ответов (чекбоксы)
            if (question.is_multiple && Array.isArray(answerValue)) {
                answerValue.forEach(answerId => {
                    if (answerId) { // Проверяем, что answerId существует
                        formattedAnswers.push({
                            questionID: parseInt(questionId), // Явно преобразуем в число
                            answerID: parseInt(answerId)     // Явно преобразуем в число
                        })
                    }
                })
            } 
            // Для одиночных ответов (радиокнопки)
            else if (!question.is_multiple && answerValue) {
                formattedAnswers.push({
                    questionID: parseInt(questionId), // Явно преобразуем в число
                    answerID: parseInt(answerValue)   // Явно преобразуем в число
                })
            }
        }
        
        // Логируем результат для проверки
        console.log('Отправляемые answers:', formattedAnswers)
        console.log('telegram_id:', userStore.user?.id || userStore.userId?.value || 999999)
        
        // Отправляем запрос
        const response = await fetch('http://127.0.0.1:8080/api/diagnostic/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'X-Telegram-Init-Data': window.Telegram.WebApp.initData
            },
            body: JSON.stringify({
                telegram_id: userStore.user?.id || userStore.userId?.value || 999999,
                answers: formattedAnswers
            })
        })
        
        const result = await response.json()
        
        if (response.ok && result.success) {
            // Сохраняем результат в store
            userStore.setDiagnosticResult(result.data)
            console.log('Результаты сохранены:', result.data)
            
            // Переходим на страницу результатов
            router.push('/results')
        } else {
            console.error('Ошибка сервера:', result)
            // Показываем пользователю сообщение об ошибке
            alert('Не удалось сохранить результаты. Попробуйте еще раз.')
        }
    } catch (err) {
        console.error('Ошибка при отправке:', err)
        alert('Ошибка соединения. Проверьте подключение к серверу.')
    }
}

// Загружаем вопросы при монтировании
onMounted(() => {
    fetchQuestions()
})
</script>

<template>
    <div class="question-container">
        <!-- Загрузка -->
        <div v-if="loading" class="loading">
            Загрузка вопросов...
        </div>

        <!-- Ошибка -->
        <div v-else-if="error" class="error">
            Ошибка: {{ error }}
        </div>

        <!-- Вопросы -->
        <div v-else-if="questions.length > 0">
            <h3 class="question-title">{{ currentIndex + 1 }}. {{ currentQuestion.text }}</h3>

            <!-- Варианты ответов -->
            <div class="answers-list">
                <!-- Одиночный выбор (radio) -->
                <label v-for="answer in currentQuestion.answers" :key="answer.id" class="answer-item"
                    v-if="!currentQuestion.is_multiple">
                    <input type="radio" :name="`question_${currentQuestion.id}`" :value="answer.id"
                        v-model="selectedAnswer" />
                    <span>{{ answer.text }}</span>
                </label>

                <!-- Множественный выбор (checkbox) -->
                <label v-for="answer in currentQuestion.answers" :key="answer.id" class="answer-item"
                    v-if="currentQuestion.is_multiple">
                    <input type="checkbox" :name="`question_${currentQuestion.id}`" :value="answer.id"
                        v-model="selectedAnswersMultiple" />
                    <span>{{ answer.text }}</span>
                </label>
            </div>
        </div>

        <p class="question-footer">CryoMe — результат здесь и сейчас. каждый день.</p>
    </div>
    <div class="navigation">


        <Button @click="nextQuestion" :btnTitle="currentIndex === questions.length - 1 ? 'Завершить' : 'Далее'" />

        <Button @click="prevQuestion" btnTitle="Предыдущий вопрос" />
    </div>
</template>

<style scoped>
.question-container {
    border: 1px solid var(--color-black);
    background-color: var(--color-light-gray);
    padding: 25px 15px;
    border-radius: 30px;
    height: 548px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.question-title {
    font-size: 28px;
    font-weight: 500;
    margin-bottom: 30px;
}

.answers-list {
    display: flex;
    flex-direction: column;
    gap: 11px;
    font-size: 17px;
}

.question-footer {
    font-size: 16px;
    opacity: 0.3;
    font-weight: 500;
    text-align: center;
    max-width: 300px;
    margin: 0 auto;
}

.navigation {
    display: flex;
    flex-direction: column;
    gap: 15px;
    position: relative;
    bottom: -30px;
}
</style>