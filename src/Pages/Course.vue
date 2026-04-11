<script setup>
import { watch } from 'vue';
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '.././stores/userStore'
import Button from './../components/Button.vue'

const userStore = useUserStore();
const router = useRouter();

const days = ref([]);
const progressBar = ref(0);
const selectedOptions = ref([])
const isFormValid = ref(false);
const selectedDay = ref();

onMounted(() => {
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp
        tg.BackButton.show()
        tg.BackButton.onClick(() => {
            router.back()
        })
    }
})

onUnmounted(() => {
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.BackButton.hide()
    }
})

const getCourseDays = async () => {
    const telegram_id = userStore.user?.id || 999999;
    const course_id = userStore.course;
    
    console.log('getCourseDays - course_id:', course_id);
    
    if (!course_id) {
        console.log('Нет course_id, ждём загрузки...');
        return null;
    }

    try {
        const url = `http://127.0.0.1:8080/api/course/calendar?telegram_id=${telegram_id}&course_id=${course_id}`;
        console.log('URL:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "Content-type": 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Текст ошибки:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        days.value = data.data || data;
        console.log('Дни загружены:', days.value);
        
        // Автоматически выбираем первый день, если ещё не выбран
        if (days.value.length > 0 && !selectedDay.value) {
            selectedDay.value = days.value[0];
        }
        
        return days.value;

    } catch (error) {
        console.error('❌ Ошибка getCourseDays:', error.message);
        return null;
    }
}

const getCourseProgress = async () => {
    const telegram_id = userStore.user?.id || 999999;
    const course_id = userStore.course;
    
    console.log('getCourseProgress - course_id:', course_id);
    
    if (!course_id) {
        return null;
    }

    try {
        const url = `http://127.0.0.1:8080/api/course/user/progress?telegram_id=${telegram_id}&course_id=${course_id}`;
        console.log('Progress URL:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "Content-type": 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Текст ошибки:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        progressBar.value = data.data || data;
        console.log('Прогресс:', progressBar.value);
        return progressBar.value;

    } catch (error) {
        console.error('❌ Ошибка getCourseProgress:', error.message);
        return null;
    }
}

const setSelectedDay = (day) => {
    selectedDay.value = day;
}

const setDayComplete = async (day) => {
    if (selectedOptions.value.length !== 3) {
        alert('Пожалуйста, отметьте все пункты');
        return;
    }

    const course_id = userStore.course;
    
    if (!course_id) {
        alert('Курс не найден');
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:8080/api/course/day/complete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                telegram_id: userStore.user?.id || 999999,
                day_number: day,
                course_id: course_id,
            })
        })

        const result = await response.json()
        console.log('День завершён:', result);

        if (response.ok) {
            // Перезагружаем данные
            await getCourseDays();
            await getCourseProgress();

            // Обновляем выбранный день
            const updatedDay = days.value.find(d => d.day_number === day);
            if (updatedDay) {
                selectedDay.value = updatedDay;
            }

            // Очищаем чекбоксы
            selectedOptions.value = [];
        } else {
            alert('Ошибка: ' + (result.message || 'Не удалось завершить день'));
        }

    } catch (err) {
        console.error('Ошибка при отправке:', err)
        alert('Ошибка соединения. Проверьте подключение к серверу.')
    }
}

// Следим за загрузкой курса в store
watch(() => userStore.course, async (newCourse) => {
    if (newCourse) {
        console.log('Курс загружен в store, ID:', newCourse);
        await getCourseDays();
        await getCourseProgress();
    }
}, { immediate: true })

// Следим за чекбоксами
watch(selectedOptions, (newValue) => {
    isFormValid.value = newValue.length === 3;
}, { deep: true });
</script>

<template>

    <div class="container gray">
        <h1 class="title">
            Начинаем трансформацию кожи
            и бережный уход за ней
        </h1>
        <p class="subtitle">
            21 день — это цикл обновления кожи.
            Следуй протоколу, чтобы увидеть результат.
        </p>

        <div class="days">
            <div v-for="day in days" class="day" @click="setSelectedDay(day)"
                :style="!day.completed ? { border: '1px solid #000' } : { border: '1px solid transparent' }">
                <svg v-if="day.id === 1 || day.completed" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <g opacity="0.3">
                        <path
                            d="M7 10.0001H20C20.2652 10.0001 20.5196 10.1054 20.7071 10.293C20.8946 10.4805 21 10.7349 21 11.0001V21.0001C21 21.2653 20.8946 21.5197 20.7071 21.7072C20.5196 21.8947 20.2652 22.0001 20 22.0001H4C3.73478 22.0001 3.48043 21.8947 3.29289 21.7072C3.10536 21.5197 3 21.2653 3 21.0001V11.0001C3 10.7349 3.10536 10.4805 3.29289 10.293C3.48043 10.1054 3.73478 10.0001 4 10.0001H5V9.00009C4.99943 7.42279 5.53158 5.89153 6.51019 4.65452C7.4888 3.41752 8.8565 2.54727 10.3916 2.18485C11.9267 1.82243 13.5392 1.98909 14.9677 2.6578C16.3963 3.32651 17.5571 4.45809 18.262 5.86909L16.473 6.76309C15.9695 5.75511 15.1403 4.94674 14.1198 4.46904C13.0994 3.99134 11.9475 3.87232 10.8509 4.13127C9.7543 4.39022 8.77733 5.01196 8.07836 5.8957C7.37939 6.77943 6.9994 7.87335 7 9.00009V10.0001ZM5 12.0001V20.0001H19V12.0001H5ZM10 15.0001H14V17.0001H10V15.0001Z"
                            fill="black" />
                    </g>
                </svg>

                <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M19 10H20C20.2652 10 20.5196 10.1054 20.7071 10.2929C20.8946 10.4804 21 10.7348 21 11V21C21 21.2652 20.8946 21.5196 20.7071 21.7071C20.5196 21.8946 20.2652 22 20 22H4C3.73478 22 3.48043 21.8946 3.29289 21.7071C3.10536 21.5196 3 21.2652 3 21V11C3 10.7348 3.10536 10.4804 3.29289 10.2929C3.48043 10.1054 3.73478 10 4 10H5V9C5 7.14348 5.7375 5.36301 7.05025 4.05025C8.36301 2.7375 10.1435 2 12 2C13.8565 2 15.637 2.7375 16.9497 4.05025C18.2625 5.36301 19 7.14348 19 9V10ZM5 12V20H19V12H5ZM11 14H13V18H11V14ZM17 10V9C17 7.67392 16.4732 6.40215 15.5355 5.46447C14.5979 4.52678 13.3261 4 12 4C10.6739 4 9.40215 4.52678 8.46447 5.46447C7.52678 6.40215 7 7.67392 7 9V10H17Z"
                        fill="black" />
                </svg>
                <p>{{ day.day_number }} День</p>
            </div>
        </div>

        <div class="progress__bar">
            <span :style="{ width: `${progressBar}%` }" class="progress__bar-item"></span>
        </div>

        <div class="descr">

            <div class="descr__inner" v-if="selectedDay">
                <h2 class="descr__title">
                    {{ selectedDay.day_number }} день
                </h2>
                <p class="descr__subtitle">{{ selectedDay.description }} </p>
            </div>

            <div class="descr__inner" v-else>
                <h2 class="descr__title">Выберите день курса</h2>
            </div>

            <div v-if="selectedDay && !selectedDay.completed" class="checkbox-group">
                <label class="checkbox-label">
                    <input type="checkbox" value="option1" v-model="selectedOptions" />
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-text">Очистить лицо</span>
                </label>

                <label class="checkbox-label">
                    <input type="checkbox" value="option2" v-model="selectedOptions" />
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-text">Сделать крио-уход с флюидом (утром и вечером)</span>
                </label>

                <label class="checkbox-label">
                    <input type="checkbox" value="option3" v-model="selectedOptions" />
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-text">Зафиксировать результат кремом</span>
                </label>
            </div>

            <div v-else-if="selectedDay && selectedDay.completed">
                <h2 class="title">Вы молодец! Позже будут доступны последующие дни</h2>
            </div>

            <Button class="button" btnTitle="Отправить" @click="setDayComplete(selectedDay.day_number)"
                :disabled="!isFormValid || selectedDay.completed">
            </Button>

            <img class="descr__image" src="/day.jpg" alt="">

            <Button class="button" btnTitle="Ждем тебя завтра!">
            </Button>
        </div>

    </div>

</template>

<style lang="scss" scoped>
.container {
    background-color: var(--color-gray);
}

.button {
    margin-top: 15px;
    margin-bottom: 15px;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

}

.title {
    font-size: 36px;
    font-weight: 700;
    margin-block: 0 6px;
    line-height: 100%;
}

.subtitle {
    line-height: 110%;
}

.days {
    margin-top: 15px;
    margin-bottom: 15px;
    padding-block: 15px 25px;
    border-top: 1px solid rgba(0, 0, 0, 1);
    gap: 10px;
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    scrollbar-width: thin;
    -webkit-overflow-scrolling: touch;
}

.day {
    background-color: #FFF;
    padding: 4px;
    flex-shrink: 0;
    width: 64px;
    height: 77px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 50px;
    font-size: 13px;
}

.progress__bar {
    max-width: 430px;
    width: 100%;
    height: 20px;
    background-color: rgba(217, 217, 217, 1);
    border-radius: 50px;

    &-item {
        background-color: #000;
        display: block;
        height: 20px;
        min-width: 20px;
        border-radius: 50px;
    }
}

.descr {

    &__title {
        font-size: 36px;
        font-weight: 700;
        margin-top: 30px;
        margin-bottom: 10px;
    }

    &__subtitle {
        line-height: 100%;
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 20px;
    }
}

.checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;

    input {
        display: none;
    }

    .checkbox-custom {
        width: 20px;
        height: 20px;
        border-radius: 4px; // У радио был круг, у чекбокса - квадрат
        background-color: #e0e0e0; // Серый фон для обычных
        transition: all 0.2s;
        position: relative;
    }

    // Чёрный фон для выбранного
    input:checked+.checkbox-custom {
        background-color: #000; // Чёрный

        // Галочка внутри
        &::after {
            content: '';
            position: absolute;
            left: 6px;
            top: 2px;
            width: 6px;
            height: 10px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
        }
    }

    .checkbox-text {
        font-size: 17px;
    }
}
</style>