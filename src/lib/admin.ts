"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type AdSlot = {
    slug: string;
    eyebrow: string | null;
    title: string;
    description: string | null;
    image_url: string | null;
    cta_label: string | null;
    cta_href: string | null;
    is_active: boolean;
    updated_at: string;
};

/**
 * Resolves the current user's admin flag from `public.profiles`.
 *
 * Returns `{ loading, isAdmin, userId }`. `isAdmin` is `null` while we are
 * still resolving the session so callers can show a skeleton instead of
 * flashing a "not allowed" screen before the answer comes back.
 */
export function useIsAdmin() {
    const [state, setState] = useState<{
        loading: boolean;
        isAdmin: boolean | null;
        userId: string | null;
    }>({ loading: true, isAdmin: null, userId: null });

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                if (!cancelled) setState({ loading: false, isAdmin: false, userId: null });
                return;
            }

            const { data, error } = await supabase
                .from("profiles")
                .select("is_admin")
                .eq("id", user.id)
                .maybeSingle();

            if (cancelled) return;
            setState({
                loading: false,
                isAdmin: !error && data?.is_admin === true,
                userId: user.id
            });
        })();

        return () => { cancelled = true; };
    }, []);

    return state;
}
