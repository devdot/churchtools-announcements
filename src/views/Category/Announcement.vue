<script setup lang="ts">
import { format } from 'date-and-time';
import de from 'date-and-time/locales/de';
import { ref, toRaw } from 'vue';
import { useAnnouncements } from '../../composables/useAnnouncements';
import type { Announcement, AnnouncementAppointment } from '../../types/Announcement';
import type { Category } from '../../types/Category';

const props = defineProps<{ category: Category; announcement: Announcement; canEdit: boolean }>();
const announcement = ref(toRaw(props.announcement)); // todo: is toRaw problematic here?
const isEditing = ref(false);

const { updateCustom, deleteCustom } = useAnnouncements(props.category);

const getDateString = function (appointment: AnnouncementAppointment): string {
    if (appointment.allDay) {
        const start = format(new Date(appointment.startDate), 'DD. MMMM', { locale: de });
        const end = format(new Date(appointment.endDate), 'DD. MMMM', { locale: de });
        return start === end ? start : start + ' - ' + end;
    } else {
        return format(new Date(appointment.startDate), 'DD. MMMM HH:mm', { locale: de });
    }
};
</script>
<template>
    <div v-if="announcement.type === 'appointment'">
        <div class="text-lg">
            <span>{{ announcement.title }}</span>
            <span v-if="announcement.subtitle?.length ?? 0 > 0">
                ({{ announcement.subtitle }})
            </span>
            <span class="text-xs select-none"> #{{ announcement.id }}</span>
        </div>
        <div class="pl-4">
            <div class="font-bold">{{ getDateString(announcement) }}</div>
            <div v-if="announcement.description?.length ?? 0 > 0">
                {{ announcement.description }}
            </div>
        </div>
    </div>
    <div v-else-if="announcement.type === 'custom'">
        <div class="text-lg">
            <input v-if="isEditing" v-model="announcement.title" />
            <span v-else>{{ announcement.title }}</span>
        </div>
        <div class="pl-4">
            <textarea v-if="isEditing" v-model="announcement.description" />
            <span v-else>{{ announcement.description }}</span>
        </div>
        <div v-if="canEdit">
            <button v-if="!isEditing" @click="isEditing = true">Edit</button>
            <button v-else @click="updateCustom(announcement)">Save</button>
            <button @click="deleteCustom(announcement)">Delete</button>
        </div>
    </div>
    <div v-else>Unknown type: {{ announcement.type }}</div>
</template>
