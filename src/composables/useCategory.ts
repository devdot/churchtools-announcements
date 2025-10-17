import {
    useCustomModuleDataValuesMutations,
    useCustomModuleDataValuesQuery,
} from '@churchtools/utils';
import { computed, type Ref } from 'vue';
import {
    type Category,
    type CategoryData,
    type CategoryDataRule,
    type CategoryDataSettings,
} from '../types/Category';
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
    const { data: dataRules } = loadData<CategoryDataRule>();
    const rules = computed(() => filterData(dataRules, 'rule'));
    const rulesLoaded = isDataLoaded(dataRules);

    return {
        settings,
        settingsLoaded,
        updateSettings,
        rules,
        rulesLoaded,
    };
}
