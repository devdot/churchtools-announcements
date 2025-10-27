<script setup lang="ts">
import {
    Button,
    Card,
    Divider,
    FloatLabel,
    InputNumber,
    InputText,
    MultiSelect,
    Select,
    Textarea,
} from 'primevue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import useCalendars from '../../composables/useCalendars';
import useCategories from '../../composables/useCategories';
import useCategory from '../../composables/useCategory';
import type { Category, CategoryDataSettings, CategorySettings } from '../../types/Category';

const props = defineProps<{ category: Category; settings: CategoryDataSettings }>();
const category = ref(JSON.parse(JSON.stringify(props.category)));
const settings = ref(JSON.parse(JSON.stringify(props.settings)));
const { updateCategory, deleteCategory } = useCategories();
const { updateSettings } = useCategory(props.category);

const { calendars, isLoading: calendarsLoading } = useCalendars();

const router = useRouter();

const intervalTypes: { name: string; value: CategorySettings['interval']['type'] }[] = [
    { name: 'Wochentag', value: 'week' },
    { name: 'Monatstag', value: 'month' },
    { name: 'Nie', value: 'never' },
];

const dirtyHeader = ref(false);
const saveHeader = function () {
    dirtyHeader.value = false;
    updateCategory(category.value).then(() => router.go(0));
};
const dirtyMain = ref(false);
const saveMain = function () {
    dirtyMain.value = false;

    // sanitize calendarIds
    if (settings.value.calendarIds.find(val => val === -1)) {
        settings.value.calendarIds = [-1];
    } else if (settings.value.calendarIds.length === calendars.value.length) {
        settings.value.calendarIds = [-1];
    }

    updateSettings(settings.value);
};

const confirmDelete = ref(false);
const del = function () {
    deleteCategory(category.value).then(() => router.push({ name: 'overview' }));
};
</script>
<template>
    <div class="space-y-5">
        <div class="flex justify-between">
            <h1 class="text-display-m">Einstellungen</h1>
            <div>
                <Button v-if="confirmDelete" :severity="'danger'" @click="del">Bestätigen</Button>
                <Button v-else outlined :severity="'danger'" @click="confirmDelete = true"
                    >Löschen</Button
                >
            </div>
        </div>
        <Card>
            <template #content>
                <div class="space-y-2">
                    <FloatLabel variant="on">
                        <InputText
                            id="name"
                            v-model="category.name"
                            fluid
                            size="large"
                            type="text"
                            @update:model-value="dirtyHeader = true"
                        />
                        <label for="name">Name</label>
                    </FloatLabel>
                    <FloatLabel variant="on">
                        <InputText
                            id="shorty"
                            v-model="category.shorty"
                            :disabled="true"
                            fluid
                            size="small"
                            @update:model-value="dirtyHeader = true"
                        />
                        <label for="shorty">Shorty</label>
                    </FloatLabel>
                    <FloatLabel variant="on">
                        <Textarea
                            id="description"
                            v-model="category.description"
                            fluid
                            :rows="6"
                            @update:model-value="dirtyHeader = true"
                        />
                        <label for="description">Beschreibung</label>
                    </FloatLabel>
                    <Button :disabled="!dirtyHeader" fluid :severity="'success'" @click="saveHeader"
                        >Speichern</Button
                    >
                </div>
            </template>
        </Card>
        <Card>
            <template #content>
                <div class="space-y-2">
                    <FloatLabel variant="on">
                        <MultiSelect
                            id="calendarIds"
                            v-model="settings.calendarIds"
                            display="chip"
                            fluid
                            :loading="calendarsLoading"
                            option-label="name"
                            option-value="id"
                            :options="calendars.concat({ name: '- Alle -', id: -1 })"
                            placeholder="Keiner"
                            showClear
                            @update:model-value="dirtyMain = true"
                        />
                        <label for="calendarIds">Quell-Kalender für Termine</label>
                    </FloatLabel>
                    <FloatLabel variant="on">
                        <InputNumber
                            id="cutoffDays"
                            v-model="settings.cutoffDays"
                            fluid
                            :max="720"
                            :min="0"
                            mode="decimal"
                            showButtons
                            suffix=" Tage"
                            @update:model-value="dirtyMain = true"
                        />
                        <label for="cutoffDays">Maximale Vorausschau</label>
                    </FloatLabel>
                    <FloatLabel variant="on">
                        <InputNumber
                            id="pruneDays"
                            v-model="settings.pruneDays"
                            fluid
                            :max="365"
                            :min="0"
                            mode="decimal"
                            showButtons
                            suffix=" Tage"
                            @update:model-value="dirtyMain = true"
                        />
                        <label for="pruneDays">Maximales Alter</label>
                    </FloatLabel>
                    <Divider />
                    <FloatLabel variant="on">
                        <Select
                            id="eventCalendarId"
                            v-model="settings.eventCalendarId"
                            fluid
                            :loading="calendarsLoading"
                            option-label="name"
                            option-value="id"
                            :options="calendars"
                            placeholder="Keiner"
                            showClear
                            @update:model-value="dirtyMain = true"
                        />
                        <label for="eventCalendarId">Ankündigungs-Sets aus Event-Kalender</label>
                    </FloatLabel>
                    <FloatLabel variant="on">
                        <Select
                            id="interval.type"
                            v-model="settings.interval.type"
                            fluid
                            option-label="name"
                            option-value="value"
                            :options="intervalTypes"
                            placeholder="Nie"
                            @update:model-value="dirtyMain = true"
                        />
                        <label for="interval.type">Ankündigungs-Sets nach Interval</label>
                    </FloatLabel>
                    <FloatLabel v-if="settings.interval.type !== 'never'" variant="on">
                        <InputNumber
                            id="interval.day"
                            v-model="settings.interval.day"
                            fluid
                            :max="settings.interval.type === 'week' ? 6 : 31"
                            :min="settings.interval.type === 'week' ? 0 : 1"
                            mode="decimal"
                            showButtons
                            @update:model-value="dirtyMain = true"
                        />
                        <label v-if="settings.interval.type === 'week'" for="interval.day"
                            >Wochentag (0 = Sonntag)</label
                        >
                        <label v-if="settings.interval.type === 'month'" for="interval.day"
                            >Monatstag</label
                        >
                    </FloatLabel>
                    <Button :disabled="!dirtyMain" fluid :severity="'success'" @click="saveMain"
                        >Speichern</Button
                    >
                </div>
            </template>
        </Card>
    </div>
</template>
