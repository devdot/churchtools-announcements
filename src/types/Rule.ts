import { toRaw } from 'vue';
import type { AppointmentBase } from '../utils/ct-types';

export interface Rule {
    ruleNr: number;
    negate: boolean;
    filter: RuleFilter;
}

export interface RuleFilter {
    type: RuleFilterType;
}

export type RuleFilterMap<TValue> = {
    and: TValue;
    or: TValue;
    create: TValue;
    calendar: TValue;
    text: TValue;
};
export type RuleFilterType = keyof RuleFilterMap<boolean>;
export const ruleFilterTypeNames: RuleFilterMap<string> = {
    and: 'Und-Verknüpfung',
    or: 'Oder-Verknüpfung',
    create: 'Neue Regel',
    calendar: 'Kalender',
    text: 'Text',
};

// todo: Filter date min / max

export type RuleFilterFunction<T extends RuleFilter> = {
    (filter: T, appointment: AppointmentBase): boolean;
};

export interface RuleFilterGroup extends RuleFilter {
    nextRuleNr: number;
    type: 'or' | 'and';
    rules: Rule[];
}

export interface RuleFilterAnd extends RuleFilterGroup {
    type: 'and';
}

export interface RuleFilterOr extends RuleFilterGroup {
    type: 'or';
}

export interface RuleFilterCreate extends RuleFilter {
    type: 'create';
    create: RuleFilterType | null;
}

export interface RuleFilterCalendar extends RuleFilter {
    type: 'calendar';
    calendarId: number;
}

export interface RuleFilterText extends RuleFilter {
    type: 'text';
    field: RuleFilterTextFields;
    search: string;
    regex: boolean;
}

export type RuleFilterTextFields = 'title' | 'subtitle' | 'description';

export const filterFactory = function (type: RuleFilterType) {
    const baseFactory = <T extends RuleFilter>(type: string, filter: Omit<T, 'type'>) => {
        return () => ({
            type: type,
            ...filter,
        });
    };
    const factories: RuleFilterMap<{ (): RuleFilter }> = {
        and: baseFactory<RuleFilterAnd>('and', { nextRuleNr: 0, rules: [] }),
        or: baseFactory<RuleFilterOr>('or', { nextRuleNr: 0, rules: [] }),
        create: baseFactory<RuleFilterCreate>('create', { create: null }),
        calendar: baseFactory<RuleFilterCalendar>('calendar', { calendarId: -1 }),
        text: baseFactory<RuleFilterText>('text', {
            field: 'title',
            search: '',
            regex: false,
        }),
    };
    const factory = factories[type] ?? (() => {});
    return factory();
};

export const ruleFactory = function (filter: RuleFilterType = 'create', id: number = 0): Rule {
    return {
        ruleNr: id,
        negate: false,
        filter: filterFactory(filter),
    };
};

export const addRule = function (
    filter: RuleFilterGroup,
    rule: Rule | RuleFilterType = 'create',
): Rule {
    if (typeof rule === 'string') {
        rule = ruleFactory(rule, filter.nextRuleNr);
    }
    filter.rules.push(rule);
    filter.nextRuleNr++;
    return rule;
};

const functions: RuleFilterMap<RuleFilterFunction<RuleFilter>> = {
    create: (filter: RuleFilterCreate, appointment: AppointmentBase) =>
        filter !== null || appointment !== null,
    calendar: function (filter: RuleFilterCalendar, appointment: AppointmentBase) {
        return filter.calendarId === -1 || appointment.calendar.id === filter.calendarId;
    },
    text: function (filter: RuleFilterText, appointment: AppointmentBase) {
        const field = appointment[filter.field] ?? null;
        if (typeof field === 'string') {
            if (filter.regex) {
                return field.match(filter.search) !== null;
            }
            return field === filter.search;
        }
        return false;
    },
};

export function filterRule(rule: Rule, appointment: AppointmentBase): boolean {
    const expected = rule.negate !== true;

    switch (rule.filter.type) {
        case 'and': {
            const rules = (rule.filter as RuleFilterAnd).rules;
            for (const rule of rules) {
                if (filterRule(rule, appointment) !== expected) {
                    return false;
                }
            }
            return true;
        }
        case 'or': {
            const rules = (rule.filter as RuleFilterOr).rules;
            for (const rule of rules) {
                if (filterRule(rule, appointment) === expected) {
                    return true;
                }
            }
            return rules.length === 0;
        }
        default: {
            const func = functions[rule.filter.type];
            if (typeof func === 'function') {
                // @ts-expect-error ignore type casting of rule here because we cannot do it better
                return functions[rule.filter.type](rule.filter, appointment) === expected;
            }
            throw 'Type not found: ' + rule.filter.type;
        }
    }
}

// https://stackoverflow.com/questions/65732144/vue-js-3-replace-update-reactive-object-without-losing-reactivity/77573857#77573857
export const copyRule = function (dstObj: Rule, srcObj: Rule): void {
    const dst = dstObj;
    const src = toRaw(srcObj);

    const _removeExtras = function (dst: object, src: object) {
        for (const key in dst) {
            if (typeof src[key] === 'undefined') {
                delete dst[key];
            }
        }
    };

    const _copyProperties = function (dst: object, src: object, except: string[] = []) {
        for (const key in src) {
            if (!except.includes(key)) {
                dst[key] = src[key];
            }
        }
    };

    // remove everything from dst that is not in src
    _removeExtras(dst, src);

    // add everything from src to dst
    _copyProperties(dst, src, ['filter']);

    // remove extras in filter
    _removeExtras(dst.filter, src.filter);

    // copy everything in filter again
    _copyProperties(dst.filter, src.filter, ['rules']);

    // take care of recursion
    if (Array.isArray(src.filter.rules ?? null)) {
        if (!Array.isArray(dst.filter.rules ?? null)) {
            dst.filter.rules = [];
        }

        const srcRules: Rule[] = src.filter.rules;
        const dstRules: Rule[] = dst.filter.rules;

        const srcNrMap: Rule[] = [];
        srcRules.forEach(rule => (srcNrMap[rule.ruleNr] = rule));

        const removeFromDst: number[] = [];
        dstRules.forEach(function (rule, key) {
            const srcMatched = srcNrMap[rule.ruleNr] ?? null;
            if (srcMatched !== null) {
                // update keys that are in both
                copyRule(rule, srcMatched);
                delete srcNrMap[rule.ruleNr];
            } else {
                // add those for removing
                removeFromDst.push(key);
            }
        });

        // remove marked
        removeFromDst.reverse().forEach(key => dstRules.splice(key, 1));

        // add remaining
        srcNrMap.forEach(rule => dstRules.push(rule));
    }
};
