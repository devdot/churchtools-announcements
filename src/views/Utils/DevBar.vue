<script setup lang="ts">
import { ref } from 'vue';

const NAME = import.meta.env.VITE_KEY;

const isDarkMode = ref(document.body.classList.contains('dark'));
const toggleDarkMode = function () {
    isDarkMode.value = !isDarkMode.value;
    if (isDarkMode.value) {
        document.body.classList.add('dark');
        document.documentElement.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
        document.documentElement.classList.remove('dark');
    }
};
</script>
<template>
    <div
        class="bg-foreground-primary border-basic-divider flex items-center justify-between border-b select-none"
    >
        <div>
            DEV for <span class="font-mono">{{ NAME }}</span>
        </div>
        <div @click="toggleDarkMode">Toggle {{ isDarkMode ? 'light' : 'dark' }}</div>
    </div>
</template>
