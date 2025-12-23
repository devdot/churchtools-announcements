<script setup lang="ts">
import { Chip } from 'primevue';

const props = defineProps<{
    person: {
        id: number;
        title: string;
        imageUrl: string;
        frontendUrl: string;
    };
}>();
</script>
<template>
    <a :href="props.person.frontendUrl">
        <Chip :image="props.person.imageUrl" :label="props.person.title" />
    </a>
</template>
