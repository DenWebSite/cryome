<script setup>
import Button from '@/components/Button.vue';
import { RouterLink } from 'vue-router';

</script>

<template>
    <div class="container">
        <h1 class="hero__title">21 день, который меняет кожу</h1>
        <p class="hero__subtitle">Мы не просто подбираем средство — мы сопровождаем тебя до результата. </p>
        <p class="hero__subtitle">Каждый флюид — это система: увлажнение, восстановление или сияние.</p>

        <img class="hero__image" src="/redhead-girl.jpg" alt="image" width="430" height="573">

        <RouterLink to="/question">
            <Button btnTitle="Пройти диагностику"></Button>
        </RouterLink>
    </div>
</template>

<style lang="scss" scoped>
.hero {
    &__image {
        margin-bottom: 30px;
    }

    &__title {
        font-weight: 700;
        font-size: 36px;
        letter-spacing: -3%;
        align-items: center;
        margin-block: 0 14px;
        line-height: 100%;
    }

    &__subtitle {
        font-size: 16px;
        line-height: 95%;
        margin-bottom: 10px;
        position: relative;

        &::before {
            content: '';
            position: absolute;
            width: 6px;
            height: 6px;
            background-color: var(--color-black);
            border-radius: 50px;
            left: -10px;
            top: 50%;
            transform: translateY(-50%);
        }
    }
}
</style>
