<script setup lang="ts">
import { Button, Card, Dialog } from 'primevue';
import { ref } from 'vue';
import useCategories from '../composables/useCategories';
import CategoryCreate from './Category/CategoryCreate.vue';
import Layout from './Layout.vue';

const { categories } = useCategories();
const create = ref(false);
</script>
<template>
    <Layout>
        <template #main>
            <div class="max-w-content mx-auto grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <RouterLink
                    v-for="category in categories"
                    :key="category.id"
                    class=""
                    :to="{ name: 'category', params: { categoryId: category.id } }"
                >
                    <Card class="h-full">
                        <template #title>{{ category.name }}</template>
                        <template #content>{{ category.description }}</template>
                    </Card>
                </RouterLink>
            </div>
            <Dialog v-model:visible="create" :class="['w-96']" header="Neue Kategorie" modal>
                <CategoryCreate />
            </Dialog>
        </template>
        <template #header-title>Ankündigungen</template>
        <template #header-buttons>
            <Button
                icon="fa-solid fa-plus"
                label="Neue Kategorie"
                severity="secondary"
                @click="create = !create"
            />
        </template>
    </Layout>
</template>
