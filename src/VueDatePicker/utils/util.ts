import { unref } from 'vue';

import type { IDefaultSelect, IMarker, MaybeElementRef, ModelValue } from '@/interfaces';
import type { ComponentPublicInstance } from 'vue';
import { format } from 'date-fns';

export const getArrayInArray = <T>(list: T[], increment = 3): T[][] => {
    const items = [];
    for (let i = 0; i < list.length; i += increment) {
        items.push([list[i], list[i + 1], list[i + 2]]);
    }

    return items;
};

function dayNameIntlMapper(locale: string) {
    return (day: number) => {
        return new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' })
            .format(new Date(`2017-01-0${day}T00:00:00+00:00`))
            .slice(0, 2);
    };
}

function dayNameDateFnsMapper(formatLocale: Locale) {
    return (day: number) => {
        return format(new Date(`2017-01-0${day}T00:00:00+00:00`), 'EEEEEE', { locale: formatLocale });
    };
}

/**
 * Generate week day names based on formatLocale or locale and in order specified in week start
 */
export const getDayNames = (formatLocale: Locale | null, locale: string, weekStart: number): string[] => {
    // Get list in order from sun ... sat
    const daysArray = [1, 2, 3, 4, 5, 6, 7];
    let days;

    // Map day order numbers to names
    if (formatLocale !== null) {
        try {
            days = daysArray.map(dayNameDateFnsMapper(formatLocale));
        } catch (e) {
            days = daysArray.map(dayNameIntlMapper(locale));
        }
    } else {
        days = daysArray.map(dayNameIntlMapper(locale));
    }

    // Get days that are in order before specified week start
    const beforeWeekStart = days.slice(0, weekStart);
    // Get days that are in order after specified week start
    const afterWeekStart = days.slice(weekStart + 1, days.length);

    // return them in correct order
    return [days[weekStart]].concat(...afterWeekStart).concat(...beforeWeekStart);
};

/**
 * Generate array of years for selection display
 */
export const getYears = (yearRange: number[] | string[], reverse?: boolean): IDefaultSelect[] => {
    const years: IDefaultSelect[] = [];
    for (let year = +yearRange[0]; year <= +yearRange[1]; year++) {
        years.push({ value: +year, text: `${year}` });
    }
    return reverse ? years.reverse() : years;
};

/**
 * Generate month names based on formatLocale or locale for selection display
 */
export const getMonths = (
    formatLocale: Locale | null,
    locale: string,
    monthFormat: 'long' | 'short',
): IDefaultSelect[] => {
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => {
        const mm = month < 10 ? `0${month}` : month;
        return new Date(`2017-${mm}-01T00:00:00+00:00`);
    });

    if (formatLocale !== null) {
        try {
            const monthDateFnsFormat = monthFormat === 'long' ? 'MMMM' : 'MMM';
            return months.map((date, i) => {
                const month = format(date, monthDateFnsFormat, { locale: formatLocale });
                return {
                    text: month.charAt(0).toUpperCase() + month.substring(1),
                    value: i,
                };
            });
        } catch (e) {
            // Do nothing. Go ahead to execute fallback
        }
    }

    const formatter = new Intl.DateTimeFormat(locale, { month: monthFormat, timeZone: 'UTC' });
    return months.map((date, i) => {
        const month = formatter.format(date);
        return {
            text: month.charAt(0).toUpperCase() + month.substring(1),
            value: i,
        };
    });
};

/**
 * Since internally watched values are in 24h mode, this will get am-pm value from set hour
 */
export const hoursToAmPmHours = (index: number): number => {
    const hoursValues = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    return hoursValues[index];
};

export const unrefElement = (elRef: MaybeElementRef): HTMLElement | null => {
    const plain = unref(elRef);
    if (!(plain as ComponentPublicInstance)?.$el) return plain as HTMLElement | null;
    return (plain as ComponentPublicInstance)?.$el;
};

export const getDefaultMarker = (marker: IMarker): IMarker => Object.assign({ type: 'dot' }, marker);

export const isModelAuto = (modelValue: ModelValue): boolean => {
    if (Array.isArray(modelValue)) {
        return !!modelValue[0] && !!modelValue[1];
    }
    return false;
};

export const errors = {
    prop: (name: string): string => `"${name}" prop must be enabled!`,
    dateArr: (name: string) => `You need to use array as "model-value" binding in order to support "${name}"`,
};

export const convertType = <T>(val: any): T => {
    return val as unknown as T;
};

export const getNumVal = (num?: string | number | null): number | null => {
    if (num === 0) return num;
    if (!num || isNaN(+num)) return null;
    return +num;
};

export const hasNumValue = (num?: number | null): boolean => {
    if (num === 0) return true;
    return !!num;
};

export const isNumNullish = (num?: number | null): num is null => {
    return num === null;
};

export const findFocusableEl = (container: HTMLElement | null): HTMLElement | undefined => {
    if (container) {
        const elementsList = container.querySelectorAll('input, button, select, textarea, a[href]');
        const elArr = [...elementsList] as HTMLElement[];
        return elArr[0];
    }
    return undefined;
};
