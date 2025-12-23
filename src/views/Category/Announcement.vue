<script setup lang="ts">
import { Button, ButtonGroup, FloatLabel, InputText, Popover, Textarea } from 'primevue';
import { computed, ref, toRaw, type Ref } from 'vue';
import { useAnnouncements } from '../../composables/useAnnouncements';
import type { Announcement } from '../../types/Announcement';
import type { Category } from '../../types/Category';
import Persons from '../Components/Persons.vue';
import PersonsSelect from '../Components/PersonsSelect.vue';
import AnnouncementOptionsDates from './AnnouncementOptionsDates.vue';

const props = defineProps<{ category: Category; announcement: Announcement; canEdit: boolean }>();
const announcement = ref(structuredClone(toRaw(props.announcement)));
const type: Ref<Announcement['type']> = computed(() => props.announcement.type);
const isEditing = ref(false);
const isAppointment = computed(() => type.value == 'appointment');

const { updateCustom, storeOptions, deleteCustom, getFormattedDateString } = useAnnouncements(
    props.category,
);

const popover = ref();
const togglePopover = event => popover.value.toggle(event);

const typeName = computed(() => (announcement.value.type == 'appointment' ? 'Termin' : 'Ansage'));

const save = function () {
    if (type.value === 'custom') {
        updateCustom(announcement.value);
    } else {
        storeOptions(announcement.value);
    }
};
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
            <div v-else class="mb-2">
                <FloatLabel variant="on">
                    <InputText
                        id="title"
                        v-model="announcement.title"
                        :disabled="isAppointment"
                        fluid
                        placeholder="Titel"
                    />
                    <label for="title" v-html="'Titel von ' + typeName"></label>
                </FloatLabel>
            </div>
            <ButtonGroup v-if="canEdit">
                <Button
                    v-if="!isEditing"
                    icon="fa-solid fa-pen"
                    outlined
                    severity="secondary"
                    size="small"
                    @click="isEditing = true"
                />
                <Button
                    v-if="isEditing"
                    icon="fa-solid fa-save"
                    outlined
                    severity="secondary"
                    size="small"
                    @click="
                        save();
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
            <div v-if="!isEditing" class="space-y-2">
                <Persons
                    v-if="announcement.options.announceeIds.length > 0"
                    :ids="announcement.options.announceeIds"
                    label="Angekündigt von:"
                />
                <p v-if="announcement.description ?? '' != ''">
                    {{ announcement.description ?? '' }}
                </p>
                <Persons
                    v-if="announcement.options.contactIds.length > 0"
                    :ids="announcement.options.contactIds"
                    label="Ansprechpartner:"
                />
                <div v-if="announcement.options?.notes ?? '' != ''" class="italic">
                    <span>Notizen: </span>
                    <span>{{ announcement.options?.notes ?? '' }} </span>
                </div>
            </div>
            <div v-else class="space-y-2">
                <PersonsSelect
                    v-model="announcement.options.announceeIds"
                    label="Angekündigt von"
                />
                <FloatLabel variant="on">
                    <Textarea
                        id="description"
                        v-model="announcement.description"
                        :disabled="isAppointment"
                        fluid
                    ></Textarea>
                    <label for="description">Beschreibung</label>
                </FloatLabel>
                <PersonsSelect v-model="announcement.options.contactIds" label="Ansprechpartner" />
                <FloatLabel variant="on">
                    <Textarea id="notes" v-model="announcement.options.notes" fluid></Textarea>
                    <label for="notes">Notizen</label>
                </FloatLabel>
            </div>
        </div>
        <Popover v-if="canEdit" ref="popover" class="min-w-96">
            <AnnouncementOptionsDates :announcement="announcement" :category="props.category" />
        </Popover>
    </div>
</template>
