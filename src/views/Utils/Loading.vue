<script setup lang="ts"></script>
<template>
    <div class="grid justify-items-center">
        <div
            class="text-surface inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-gray-500 border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
            role="status"
        ></div>
        <div class="text-gray-500">
            <slot>Lade Daten</slot>
        </div>
    </div>
</template>
