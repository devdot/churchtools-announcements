<script setup lang="ts">
import { Button, Card } from 'primevue';
import { useAnnouncements } from '../../composables/useAnnouncements';
import type { Category } from '../../types/Category';
import Loading from '../Utils/Loading.vue';
import Announcement from './Announcement.vue';

const props = defineProps<{ category: Category; categoryId: string | number }>();

const { customs, customsLoaded, createCustom } = useAnnouncements(props.category);
</script>
<template>
    <div class="max-w-content mx-auto">
        <Card>
            <template #content>
                <div v-if="customsLoaded" class="divide-y divide-gray-200">
                    <div class="flex justify-between pb-6">
                        <h1 class="text-display-m">Manuelle Ansagen</h1>
                        <Button
                            icon="fa-solid fa-plus"
                            label="Neu"
                            size="small"
                            @click="
                                createCustom({ type: 'custom', title: 'Neu', description: 'Neu' })
                            "
                        />
                    </div>
                    <Announcement
                        v-for="custom in customs"
                        :key="custom.id"
                        :announcement="custom"
                        :canEdit="true"
                        :category="props.category"
                        class="py-2"
                    />
                </div>
                <Loading v-else />
            </template>
        </Card>
    </div>
</template>
