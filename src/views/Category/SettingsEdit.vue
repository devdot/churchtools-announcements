<script setup lang="ts">
import { subtract } from 'date-and-time';
import {
    Button,
    ButtonGroup,
    Card,
    Divider,
    FloatLabel,
    InputNumber,
    InputText,
    MultiSelect,
    Select,
    Textarea,
} from 'primevue';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAnnouncements } from '../../composables/useAnnouncements';
import useCalendars from '../../composables/useCalendars';
import useCategories from '../../composables/useCategories';
import useCategory from '../../composables/useCategory';
import useServices from '../../composables/useServices';
import type { Category, CategoryDataSettings, CategorySettings } from '../../types/Category';

const props = defineProps<{ category: Category; settings: CategoryDataSettings }>();
const category = ref(JSON.parse(JSON.stringify(props.category)));
const settings = ref(JSON.parse(JSON.stringify(props.settings)));
const { updateCategory, deleteCategory } = useCategories();
const { updateSettings, can } = useCategory(props.category);

const { calendars, isLoading: calendarsLoading } = useCalendars();

const router = useRouter();

const intervalTypes: { name: string; value: CategorySettings['interval']['type'] }[] = [
    { name: 'Wochentag', value: 'week' },
    { name: 'Monatstag', value: 'month' },
    { name: 'Nie', value: 'never' },
];

const { services, isLoading: servicesLoading } = useServices();

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

const { options, deleteCustom } = useAnnouncements(props.category);
const prunableOldOptions = computed(() =>
    options.value.filter(
        option =>
            subtract(new Date(), new Date(option.a_date)).toDays().value +
                settings.value.pruneDays <
            0,
    ),
);
const pruneOldOptions = function () {
    prunableOldOptions.value.map(deleteCustom);
};
</script>
<template>
    <div class="max-w-content mx-auto space-y-5">
        <div class="flex justify-between">
            <h1 class="text-display-m">Einstellungen</h1>
            <div>
                <Button
                    v-if="confirmDelete"
                    :disabled="!can.delete"
                    icon="fa-solid fa-trash"
                    label="Bestätigen"
                    :severity="'danger'"
                    @click="del"
                />
                <Button
                    v-else
                    :disabled="!can.delete"
                    icon="fa-solid fa-trash"
                    label="Löschen"
                    outlined
                    :severity="'danger'"
                    @click="confirmDelete = true"
                />
            </div>
        </div>
        <Card>
            <template #content>
                <div class="space-y-2">
                    <FloatLabel variant="on">
                        <InputText
                            id="name"
                            v-model="category.name"
                            :disabled="!can.edit"
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
                            v-tooltip.top="
                                'Der Shorty kann nur von Administratoren in der Erweiterungs-Übersicht geändert werden!'
                            "
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
                            :disabled="!can.edit"
                            fluid
                            :rows="6"
                            @update:model-value="dirtyHeader = true"
                        />
                        <label for="description">Beschreibung</label>
                    </FloatLabel>
                    <Button
                        :disabled="!dirtyHeader || !can.edit"
                        fluid
                        :severity="'success'"
                        @click="saveHeader"
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
                            :disabled="!can.upsertData"
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
                            v-tooltip.top="
                                'Die maximale Vorausschau gibt an, wie weit im voraus Termine, Ansagen und Ankündigungs-Termine generiert bzw. angezeigt werden.'
                            "
                            :disabled="!can.upsertData"
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
                            v-tooltip.top="
                                'Das maximale Alter gibt an, bis alte Ankündigungs-Termine oder Ansage-Informationen automatisch löschbar sind.'
                            "
                            :disabled="!can.upsertData"
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
                            v-tooltip.top="
                                'Ankündigungs-Termine können automatisch aus den Events in diesem Kalender generiert werden.'
                            "
                            :disabled="!can.upsertData"
                            fluid
                            :loading="calendarsLoading"
                            option-label="name"
                            option-value="id"
                            :options="calendars"
                            placeholder="Keiner"
                            showClear
                            @update:model-value="dirtyMain = true"
                        />
                        <label for="eventCalendarId">Ankündigungs-Termine aus Event-Kalender</label>
                    </FloatLabel>
                    <FloatLabel variant="on">
                        <MultiSelect
                            id="eventAnnounceeServiceIds"
                            v-model="settings.eventAnnounceeServiceIds"
                            v-tooltip.top="
                                'Für Ankündigungen, die mit einem Event verbunden sind, können die Dienste assoziiert werden, deren eingeteilte Personen die Ankündigungen ankündigen sollen.'
                            "
                            :disabled="!can.upsertData"
                            fluid
                            :loading="servicesLoading"
                            option-label="name"
                            option-value="id"
                            :options="services"
                            placeholder="Keiner"
                            showClear
                            @update:model-value="dirtyMain = true"
                        />
                        <label for="eventAnnounceeServiceIds">Event-Dienst des Ankündigers</label>
                    </FloatLabel>
                    <FloatLabel variant="on">
                        <MultiSelect
                            id="eventShowServiceIds"
                            v-model="settings.eventShowServiceIds"
                            v-tooltip.top="
                                'Für Ankündigungen, die mit einem Event verbunden sind, können eingeteilte Personen weiterer assoziierter Dienste angezeigt werden.'
                            "
                            :disabled="!can.upsertData"
                            filter
                            fluid
                            :loading="servicesLoading"
                            option-label="name"
                            option-value="id"
                            :options="services"
                            placeholder="Keiner"
                            showClear
                            @update:model-value="dirtyMain = true"
                        />
                        <label for="eventShowServiceIds">Anzeige von Event-Diensten</label>
                    </FloatLabel>
                    <FloatLabel variant="on">
                        <Select
                            id="interval.type"
                            v-model="settings.interval.type"
                            v-tooltip.top="
                                'Ankündigungs-Termine können nach einem Intervalmuster generiert werden.'
                            "
                            :disabled="!can.upsertData"
                            fluid
                            option-label="name"
                            option-value="value"
                            :options="intervalTypes"
                            placeholder="Nie"
                            @update:model-value="dirtyMain = true"
                        />
                        <label for="interval.type">Ankündigungs-Termine nach Interval</label>
                    </FloatLabel>
                    <FloatLabel v-if="settings.interval.type !== 'never'" variant="on">
                        <InputNumber
                            id="interval.day"
                            v-model="settings.interval.day"
                            :disabled="!can.upsertData"
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
                    <Button
                        :disabled="!dirtyMain || !can.upsertData"
                        fluid
                        :severity="'success'"
                        @click="saveMain"
                        >Speichern</Button
                    >
                </div>
            </template>
        </Card>
        <Card>
            <template #content>
                <ButtonGroup>
                    <Button
                        :badge="prunableOldOptions.length + ''"
                        :disabled="prunableOldOptions.length === 0"
                        icon="fa-solid fa-trash"
                        label="Abgelaufene Daten löschen"
                        severity="secondary"
                        @click="pruneOldOptions"
                    />
                </ButtonGroup>
            </template>
        </Card>
    </div>
</template>
