"use client";

import { BIKE_COLORS, BIKE_TYPES, CITIES } from "@/lib/bikes";
import { useI18n } from "@/i18n/I18nProvider";

type ChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;

/** Bike type select. Values stay Finnish (used for matching); labels are translated. */
export function TypeSelect({ id, value, onChange, style }: { id?: string; value: string; onChange: (e: ChangeEvent) => void; style?: React.CSSProperties }) {
    const { tv } = useI18n();
    const options = BIKE_TYPES.includes(value) || !value ? BIKE_TYPES : [value, ...BIKE_TYPES];
    return (
        <select id={id} name="type" value={value} onChange={onChange} style={style}>
            {options.map(t => <option key={t} value={t}>{tv("type", t)}</option>)}
        </select>
    );
}

/** Colour select with translated labels; keeps an unknown stored value selectable. */
export function ColorSelect({ id, value, onChange, style }: { id?: string; value: string; onChange: (e: ChangeEvent) => void; style?: React.CSSProperties }) {
    const { t, tv } = useI18n();
    const options = !value || BIKE_COLORS.includes(value) ? BIKE_COLORS : [value, ...BIKE_COLORS];
    return (
        <select id={id} name="color" value={value} onChange={onChange} style={style}>
            <option value="">{t("common.choose")}</option>
            {options.map(c => <option key={c} value={c}>{tv("color", c)}</option>)}
        </select>
    );
}

/** City text input with suggestions. */
export function CityInput({ id, value, onChange, required, placeholder, style }: { id?: string; value: string; onChange: (e: ChangeEvent) => void; required?: boolean; placeholder?: string; style?: React.CSSProperties }) {
    const listId = `${id ?? "city"}-list`;
    return (
        <>
            <input id={id} name="city" list={listId} value={value} onChange={onChange} required={required} placeholder={placeholder} style={style} autoComplete="address-level2" />
            <datalist id={listId}>{CITIES.map(c => <option key={c} value={c} />)}</datalist>
        </>
    );
}
