<script setup lang="ts">
import useCategory from '../../composables/useCategory';
import type { Category } from '../../types/Category';
import Loading from '../Utils/Loading.vue';
import SettingsEdit from './SettingsEdit.vue';

const props = defineProps<{ category: Category; categoryId: string | number }>();
const { settings, settingsLoaded } = useCategory(props.category);
</script>
<template>
    <SettingsEdit v-if="settingsLoaded" :category="props.category" :settings="settings" />
    <Loading v-else />
</template>
