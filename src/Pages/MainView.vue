<script setup>
import Button from '@/components/Button.vue';
import { RouterLink } from 'vue-router';

</script>

<template>
    <div class="container gray">
        <p class="name">CryoMe</p>
        <img class="hero__image" src="/hero-image.jpg" alt="image" width="430" height="573">

        <h1 class="hero__title">Твоя кожа говорит — <br> Мы переводим</h1>
        <p class="hero__subtitle">Уход — это не про случайный выбор.</p>
        <p class="hero__subtitle">Это про точное попадание в состояние кожи сегодня.</p>

        <RouterLink to="/secondpage">
            <Button btnTitle="Начать диагностику"></Button>
        </RouterLink>
    </div>
</template>

<style lang="scss" scoped>
.name {
    text-align: center;
    font-size: 20px;
    margin-bottom: 10px;
}

.hero {

    &__title {
        font-weight: 700;
        font-size: 32px;
        letter-spacing: -3%;
        align-items: center;
        text-align: center;
        margin-block: 10px;
        line-height: 100%;
    }

    &__subtitle {
        font-size: 16px;
        text-align: center;
        line-height: 95%;


        &+& {
            margin-bottom: 30px;
        }
    }
}
</style>
