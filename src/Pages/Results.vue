<template>
    <div class="container">
        <div class="results-container">
            <div v-if="loading" class="loading">
                Загрузка...
            </div>

            <div v-else-if="result" class="results__content">
                <h1 class="title">Мы нашли твой идеальный уход</h1>
                <p class="subtitle">Основано на состоянии кожи прямо сейчас</p>

                <div class="results__box">
                    <h2>{{ result.product?.name }}</h2>
                    <p>{{ result.product?.description }}</p>
                    <img src="/fluid.jpg" alt="">
                    <p>Флюид CryoMe «Глубокое увлажнение» увлажняет, защищает кожу и подходит для ежедневного ухода.
                        Можно использовать отдельно или с кремом, при липкости — разбавить водой.</p>
                </div>

                <div class="effect">
                    <img src="/result-2.jpg" alt="image">
                    <div class="effect__inner">
                        <h3 class="effect__title">Эффект через 21 день:</h3>
                        <ul class="effect__list">
                            <li class="effect__list-item">- кожа спокойная и напитанная</li>
                            <li class="effect__list-item">- исчезает стянутость</li>
                            <li class="effect__list-item">- появляется мягкое сияние</li>
                        </ul>

                        <p class="effect__text">CryoMe — <br>когда нужен эффект</p>
                    </div>
                </div>

                <div class="buttons">
                    <a :href="result.product?.marketplace_wb_url" target="_blank" rel="noopener noreferrer">
                        <Button btnTitle="Купить на Wildberries" />
                    </a>
                    <a :href="result.product?.marketplace_ozon_url" target="_blank" rel="noopener noreferrer">
                        <Button class="white" btnTitle="Купить на Ozon" />
                    </a>

                    <RouterLink to="/course" @click="createCourse()">
                        <Button class="olive" btnTitle="Я уже купил → активировать уход" />
                    </RouterLink>
                </div>
            </div>

            <div v-else class="error">
                Не удалось загрузить результаты
            </div>
        </div>
    </div>
</template>

<script setup>

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import Button from '@/components/Button.vue';

const router = useRouter()
const userStore = useUserStore()
const loading = ref(true)
const result = ref(null)

onMounted(() => {
    // Получаем результат из store
    result.value = userStore.getDiagnosticResult()
    loading.value = false

    // Если нет результата, возвращаем на тест
    if (!result.value) {
        router.push('/question')
    }
})

const createCourse = async () => {
    console.log("sessiod_id: !!!!!! ", userStore.diagnosticResult.session_id);

    const response = await fetch('http://127.0.0.1:8080/api/course/start', {
        method: 'POST',
        headers: {
            // 'X-Telegram-Init-Data': window.Telegram.WebApp.initData,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            session_id: userStore.diagnosticResult.session_id
        })
    })

    const result = await response.json()
    console.log("result старта курса !!!",result)

    userStore.course = result.data.CourseID
    console.log("useUserStore.course!!!!!!!!!!!", useUserStore.course)

    // if (response.ok && result.success) {
    //     console.log('курс:', result.data)

    // } else {
    //     console.error('Ошибка:', result)
    // }
}
</script>

<style lang="scss" scoped>
.effect {
    margin-top: 30px;
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;

    &__inner {
        height: 270px;
        border: 1px solid var(--color-black);
        border-radius: 30px;
        padding: 10px;
    }

    &__title {
        font-weight: 500;
        line-height: 100%;
    }

    &__list {
        font-size: 15px;

        &-item {
            line-height: 100%;
        }
    }

    &__text {
        font-size: 15px;
        font-weight: 500;
        line-height: 100%;
        position: absolute;
        bottom: 20px;
    }
}

.buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 30px;
}

.white {
    background-color: #FFF;
    color: var(--color-black);
    border: 1px solid #C7C7C7;
}

.olive {
    background-color: var(--color-olive);
}

.title {
    font-size: 36px;
    font-weight: 500;
    margin-block: 0 6px;
}

.results__box {
    background-color: var(--color-olive);
    margin-top: 26px;
    padding: 25px 40px;
    border-radius: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #fff;

    h2 {
        font-size: 24px;
        font-weight: 500;
    }

    p {
        text-align: center;
        margin-block: 10px 15px;
    }
}
</style>