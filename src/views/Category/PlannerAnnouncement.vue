<script setup lang="ts">
import { formatDate } from '@churchtools/utils';
import { Button, Popover } from 'primevue';
import { ref } from 'vue';
import type { Announcement } from '../../types/Announcement';
import type { Category } from '../../types/Category';
import AnnouncementOptionsDates from './AnnouncementOptionsDates.vue';

const props = defineProps<{ category: Category; announcement: Announcement }>();

const popover = ref();
const togglePopover = event => popover.value.toggle(event);
</script>
<template>
    <div class="flex h-10 gap-1 p-1 odd:bg-white">
        <span class="w-32 shrink-0 leading-8">{{
            typeof props.announcement.startDate === 'string'
                ? formatDate(new Date(props.announcement.startDate), true)
                : ''
        }}</span>
        <span class="grow" :title="props.announcement.title ?? ''">{{
            props.announcement.title ?? ''
        }}</span>
        <Button
            icon="fa-solid fa-calendar-days"
            outlined
            severity="secondary"
            size="small"
            @click="togglePopover"
        />
        <Popover ref="popover" class="min-w-96">
            <AnnouncementOptionsDates
                :announcement="props.announcement"
                :category="props.category"
            />
        </Popover>
    </div>
</template>
