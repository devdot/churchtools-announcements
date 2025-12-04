<script setup lang="ts">
import { Button, ButtonGroup, InputText, Popover, Textarea } from 'primevue';
import { computed, ref, toRaw, type Ref } from 'vue';
import { useAnnouncements } from '../../composables/useAnnouncements';
import type { Announcement } from '../../types/Announcement';
import type { Category } from '../../types/Category';
import AnnouncementOptionsDates from './AnnouncementOptionsDates.vue';

const props = defineProps<{ category: Category; announcement: Announcement; canEdit: boolean }>();
const announcement = ref(structuredClone(toRaw(props.announcement)));
const type: Ref<Announcement['type']> = computed(() => props.announcement.type);
const isEditing = ref(false);

const { updateCustom, deleteCustom, getFormattedDateString } = useAnnouncements(props.category);

const popover = ref();
const togglePopover = event => popover.value.toggle(event);
</script>
<template>
    <div>
        <div v-if="type === 'appointment'" class="font-bold">
            {{ getFormattedDateString(announcement) }}
        </div>
        <div class="flex items-center justify-between leading-4">
            <div v-if="!isEditing" class="text-lg">
                <span>{{ announcement.title }}</span>
                <span v-if="announcement.subtitle?.length ?? 0 > 0">
                    ({{ announcement.subtitle }})
                </span>
            </div>
            <div v-else>
                <InputText v-model="announcement.title" fluid placeholder="Titel" />
            </div>
            <ButtonGroup v-if="canEdit">
                <Button
                    v-if="type === 'custom' && !isEditing"
                    icon="fa-solid fa-pen"
                    outlined
                    severity="secondary"
                    size="small"
                    @click="isEditing = true"
                />
                <Button
                    v-if="type === 'custom' && isEditing"
                    icon="fa-solid fa-save"
                    outlined
                    severity="secondary"
                    size="small"
                    @click="
                        updateCustom(announcement);
                        isEditing = false;
                    "
                />
                <Button
                    v-if="type === 'custom'"
                    icon="fa-solid fa-trash"
                    outlined
                    severity="secondary"
                    size="small"
                    @click="deleteCustom(announcement)"
                />
                <Button
                    icon="fa-solid fa-calendar-days"
                    outlined
                    severity="secondary"
                    size="small"
                    @click="togglePopover"
                />
            </ButtonGroup>
        </div>
        <div class="pl-4">
            <div v-if="!isEditing">
                {{ announcement.description ?? '' }}
            </div>
            <div v-else>
                <Textarea v-model="announcement.description" fluid></Textarea>
            </div>
        </div>
        <Popover v-if="canEdit" ref="popover" class="min-w-96">
            <AnnouncementOptionsDates :announcement="announcement" :category="props.category" />
        </Popover>
    </div>
</template>
