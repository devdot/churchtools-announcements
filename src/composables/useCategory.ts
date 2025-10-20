import {
    useCustomModuleDataValuesMutations,
    useCustomModuleDataValuesQuery,
} from '@churchtools/utils';
import { computed, type ComputedRef, type Ref } from 'vue';
import type { AnnouncementSet } from '../types/Annoucement';
import {
    type Category,
    type CategoryData,
    type CategoryDataAnnouncementSet,
    type CategoryDataRules,
    type CategoryDataSettings,
} from '../types/Category';
import { addRule, ruleFactory } from '../types/Rule';
import useModule from './useModule';

export default function useCategory(category: Category) {
    const { moduleId } = useModule();
    const categoryId = computed(() => category.id);

    const loadData = <T extends CategoryData>() =>
        useCustomModuleDataValuesQuery<T>(moduleId, categoryId);
    const filterData = <T extends CategoryData>(data: Ref<undefined> | Ref<T[]>, type: string) =>
        (data.value ?? []).filter((category: T) => category.type === type);
    const isDataLoaded = (data: Ref<undefined> | Ref<CategoryData[]>) =>
        computed(() => typeof data.value !== 'undefined');

    // settings
    const { data: dataSettings } = loadData<CategoryDataSettings>();
    const defaultSettings: CategoryDataSettings = {
        id: 0,
        type: 'settings',
        description: '',
        cutoffDays: 180,
        calendarIds: [-1],
        interval: {
            type: 'week',
            day: 0, // sunday
        },
        eventCalendarId: null,
        pruneDays: 14,
    };
    const settings = computed(() =>
        Object.assign(
            defaultSettings, // fill defaults and overwrite by actual data
            filterData(dataSettings, 'settings').pop() ?? {},
        ),
    );
    const settingsLoaded = isDataLoaded(dataSettings);
    const { createCustomDataValue, updateCustomDataValue } =
        useCustomModuleDataValuesMutations<CategoryDataSettings>(moduleId, categoryId);
    const updateSettings = (settings: CategoryDataSettings) => {
        if (settings.id > 0) {
            return updateCustomDataValue({
                dataCategoryId: category.id,
                ...settings,
            });
        }
        return createCustomDataValue({
            dataCategoryId: category.id,
            ...settings,
        });
    };

    // rules
    const { data: dataRules, dataUpdatedAt: rulesUpdatedAt } = loadData<CategoryDataRules>();
    const defaultRules = {
        id: 0,
        type: 'rules',
        ...ruleFactory('and'),
    };
    addRule(defaultRules.filter, 'calendar');
    const rules: ComputedRef<CategoryDataRules> = computed(
        () => filterData(dataRules, 'rules').pop() ?? defaultRules,
    );
    const rulesLoaded = isDataLoaded(dataRules);
    const { createCustomDataValue: createRulesValue, updateCustomDataValue: updateRulesValue } =
        useCustomModuleDataValuesMutations<CategoryDataRules>(moduleId, categoryId);
    const updateRules = async (rules: CategoryDataRules) => {
        // make sure the rule is an and rule
        if (rules.filter.type !== 'and') {
            const old = rules;
            rules = {
                ...ruleFactory('and'),
                id: rules.id,
                type: 'rules',
            };
            rules.filter.rules = [old];
        }

        // remove empty create fields
        const filterCreateFilters = function (rule: Rule) {
            if (rule.filter.type === 'and' || rule.filter.type === 'or') {
                rule.filter.rules = rule.filter.rules.filter(filterCreateFilters);
            }
            return rule.filter.type !== 'create';
        };
        rules.filter.rules = rules.filter.rules.filter(filterCreateFilters);

        // upsert
        if (rules.id > 0) {
            return updateRulesValue({
                dataCategoryId: category.id,
                ...rules,
            });
        }
        return createRulesValue({
            dataCategoryId: category.id,
            ...rules,
        });
    };

    // announcements
    const { data: dataAnnouncementSets } = loadData<CategoryDataAnnouncementSet>();
    const announcementSets = computed(() =>
        filterData(dataAnnouncementSets, 'set')
            .map(set => ({
                ...set,
                date: set.date instanceof Date ? set.date : new Date(set.date),
            }))
            .sort((a, b) => a.date.getTime() - b.date.getTime()),
    );
    const announcementSetsLoaded = isDataLoaded(dataAnnouncementSets);
    const {
        createCustomDataValue: createAnnouncementSetValue,
        updateCustomDataValue: updateAnnouncementSetValue,
        deleteCustomDataValue: deleteAnnouncementSetValue,
    } = useCustomModuleDataValuesMutations<CategoryDataAnnouncementSet>(moduleId, categoryId);
    const createAnnouncementSet = (set: Omit<AnnouncementSet, 'id'>) => {
        return createAnnouncementSetValue({
            dataCategoryId: category.id,
            id: 0,
            type: 'set',
            ...set,
        });
    };
    const updateAnnouncementSet = (set: AnnouncementSet) => {
        return updateAnnouncementSetValue({
            dataCategoryId: category.id,
            type: 'set',
            ...set,
        });
    };
    const deleteAnnouncementSet = (set: AnnouncementSet) => {
        return deleteAnnouncementSetValue({
            dataCategoryId: category.id,
            ...set,
        });
    };

    return {
        settings,
        settingsLoaded,
        updateSettings,
        rules,
        rulesLoaded,
        updateRules,
        rulesUpdatedAt,
        announcementSets,
        announcementSetsLoaded,
        createAnnouncementSet,
        updateAnnouncementSet,
        deleteAnnouncementSet,
    };
}
