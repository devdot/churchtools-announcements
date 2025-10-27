<script setup lang="ts"></script>
<template>
    <div class="bg-background-primary flex h-full w-full grow flex-col">
        <div
            class="border-basic-divider bg-foreground-primary text-body-m-emphasized lg:text-body-l-emphasized flex w-full items-center justify-between gap-6 border-0 border-b border-solid px-4 py-1 lg:px-6 lg:py-2"
        >
            <slot name="header">
                <div class="flex items-center gap-2">
                    <RouterLink :to="{ name: 'overview' }">
                        <i class="fa-solid fa-scroll"></i>
                    </RouterLink>
                    <span><slot name="header-title" /></span>
                </div>
                <div class="flex items-center gap-2">
                    <slot name="header-buttons" />
                </div>
            </slot>
        </div>
        <div class="flex grow">
            <div
                v-if="$slots.sidebar"
                class="border-basic-divider bg-foreground-primary relative w-64 flex-none overflow-y-auto border-0 border-r border-solid py-6"
            >
                <slot name="sidebar" />
            </div>
            <div class="relative mx-4 my-6 grow lg:mx-6">
                <slot name="main" />
            </div>
        </div>
    </div>
</template>
