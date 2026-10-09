import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface AuthState {
    session: Session | null;
    ready: boolean;
}

const Ctx = createContext<AuthState>({ session: null, ready: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>({ session: null, ready: false });

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => setState({ session: data.session, ready: true }));
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setState({ session, ready: true });
        });
        return () => subscription.unsubscribe();
    }, []);

    return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
