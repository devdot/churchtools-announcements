<script setup lang="ts">
import { Button, FloatLabel, InputText } from 'primevue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import useCategories from '../../composables/useCategories';

const { createCategory } = useCategories();
const router = useRouter();

const name = ref('');
const create = function () {
    createCategory({
        name: name.value,
        description: '',
    }).then(cat => router.push({ name: 'category.settings', params: { categoryId: cat.id } }));
};
</script>
<template>
    <div class="space-y-2">
        <FloatLabel variant="on">
            <InputText id="name" v-model="name" fluid type="text" />
            <label for="name">Name</label>
        </FloatLabel>
        <Button :disabled="name.trim() === ''" fluid :severity="'success'" @click="create"
            >Erstellen</Button
        >
    </div>
</template>
