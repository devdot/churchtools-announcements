<script setup lang="ts">
import { useAnnouncements } from '../../composables/useAnnouncements';
import type { Category } from '../../types/Category';
import Loading from '../Utils/Loading.vue';
import Announcement from './Announcement.vue';

const props = defineProps<{ category: Category; categoryId: string | number }>();

const { customs, customsLoaded, createCustom } = useAnnouncements(props.category);
</script>
<template>
    <div v-if="customsLoaded">
        <div class="flex gap-2">
            <button @click="createCustom({ type: 'custom', title: 'Neu', description: 'Neu' })">
                Create
            </button>
        </div>
        <Announcement
            v-for="custom in customs"
            :key="custom.id"
            :announcement="custom"
            :canEdit="true"
            :category="props.category"
        />
    </div>
    <Loading v-else />
</template>
