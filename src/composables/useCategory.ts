import {
    useCustomModuleDataValuesMutations,
    useCustomModuleDataValuesQuery,
    type ApiError,
    type CustomModuleDataValue,
} from '@churchtools/utils';
import type {
    CreateDataValue,
    UpdateDataValue,
} from '@churchtools/utils/types/custommodule/useCustomModuleDataValuesMutations';
import type { MutateFunction } from '@tanstack/vue-query';
import { computed, type ComputedRef, type Ref } from 'vue';
import type { AnnouncementCustom, AnnouncementSet } from '../types/Announcement';
import {
    type Category,
    type CategoryData,
    type CategoryDataAnnouncementCustom,
    type CategoryDataAnnouncementSet,
    type CategoryDataRules,
    type CategoryDataSettings,
} from '../types/Category';
import { addRule, ruleFactory, type Rule } from '../types/Rule';
import useModule from './useModule';
import { usePermissions } from './usePermissions';

export default function useCategory(category: Category) {
    const { moduleId } = useModule();
    const categoryId = computed(() => category.id);
    const { can: canFn } = usePermissions();
    const can = canFn(category.id);

    // templates for loading data
    const loadData = <T extends CategoryData>() =>
        useCustomModuleDataValuesQuery<T>(moduleId, categoryId);
    const filterData = <T extends CategoryData>(data: Ref<undefined> | Ref<T[]>, type: string) =>
        (data.value ?? []).filter((category: T) => category.type === type);
    const isDataLoaded = (data: Ref<undefined> | Ref<CategoryData[]>) =>
        computed(() => typeof data.value !== 'undefined');

    // templates for mutating data
    const createValue = <Type extends object, DataType extends CategoryData>(
        type: DataType['type'],
        create: MutateFunction<CustomModuleDataValue, ApiError, CreateDataValue<DataType>>,
    ) => {
        return (data: Omit<Type, 'id'>) =>
            create({
                ...data,
                dataCategoryId: category.id,
                id: 0,
                type: type,
            });
    };
    const updateValue = <Type extends object, DataType extends CategoryData>(
        type: DataType['type'],
        update: MutateFunction<CustomModuleDataValue, ApiError, UpdateDataValue<DataType>>,
    ) => {
        return (data: Type) =>
            update({
                ...data,
                dataCategoryId: category.id,
                type: type,
            });
    };
    const deleteValue = <
        Type extends Pick<CustomModuleDataValue, 'id'>,
        DataType extends CategoryData,
    >(
        del: MutateFunction<
            unknown,
            ApiError,
            Pick<DataType, 'id'> & Pick<CustomModuleDataValue, 'dataCategoryId'>
        >,
    ) => {
        return (data: Type) =>
            del({
                ...data,
                dataCategoryId: category.id,
            });
    };

    // settings
    const { data: dataSettings } = loadData<CategoryDataSettings>();
    const defaultSettings: CategoryDataSettings = {
        id: 0,
        type: 'settings',
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
    const defaultRules: CategoryDataRules = {
        id: 0,
        type: 'rules',
        ...ruleFactory('and'),
    };
    if (defaultRules.filter.type === 'and') addRule(defaultRules.filter, 'calendar');
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
            if (rules.filter.type === 'and') rules.filter.rules = [old];
            else throw 'Failed to assert new rule is AND filter';
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

    // custom announcements
    const { data: dataAnnouncementCustoms } = loadData<CategoryDataAnnouncementCustom>();
    const announcementCustoms = computed(() => filterData(dataAnnouncementCustoms, 'custom'));
    const announcementCustomsLoaded = isDataLoaded(announcementCustoms);
    const {
        createCustomDataValue: createAnnouncementCustomValue,
        updateCustomDataValue: updateAnnouncementCustomValue,
        deleteCustomDataValue: deleteAnnouncementCustomValue,
    } = useCustomModuleDataValuesMutations<CategoryDataAnnouncementCustom>(moduleId, categoryId);
    const createAnnouncementCustom = createValue<
        AnnouncementCustom,
        CategoryDataAnnouncementCustom
    >('custom', createAnnouncementCustomValue);
    const updateAnnouncementCustom = updateValue<
        AnnouncementCustom,
        CategoryDataAnnouncementCustom
    >('custom', updateAnnouncementCustomValue);
    const deleteAnnouncementCustom = deleteValue<
        AnnouncementCustom,
        CategoryDataAnnouncementCustom
    >(deleteAnnouncementCustomValue);

    // announcement sets
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

    const createAnnouncementSet = createValue<AnnouncementSet, CategoryDataAnnouncementSet>(
        'set',
        createAnnouncementSetValue,
    );
    const updateAnnouncementSet = updateValue<AnnouncementSet, CategoryDataAnnouncementSet>(
        'set',
        updateAnnouncementSetValue,
    );
    const deleteAnnouncementSet = deleteValue<AnnouncementSet, CategoryDataAnnouncementSet>(
        deleteAnnouncementSetValue,
    );

    return {
        can,
        settings,
        settingsLoaded,
        updateSettings,
        rules,
        rulesLoaded,
        updateRules,
        rulesUpdatedAt,
        announcementCustoms,
        announcementCustomsLoaded,
        createAnnouncementCustom,
        updateAnnouncementCustom,
        deleteAnnouncementCustom,
        announcementSets,
        announcementSetsLoaded,
        createAnnouncementSet,
        updateAnnouncementSet,
        deleteAnnouncementSet,
    };
}
