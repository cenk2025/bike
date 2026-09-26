"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64: string) {
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(raw, c => c.charCodeAt(0));
}

type State = "unsupported" | "loading" | "off" | "on" | "denied";

/**
 * Lets the user enable push notifications for new matches and messages on
 * this device. Hidden when the browser or deployment does not support it.
 */
export default function PushToggle() {
    const [state, setState] = useState<State>("loading");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        (async () => {
            if (!VAPID_PUBLIC_KEY || !("serviceWorker" in navigator) || !("PushManager" in window)) {
                setState("unsupported");
                return;
            }
            if (Notification.permission === "denied") {
                setState("denied");
                return;
            }
            const reg = await navigator.serviceWorker.getRegistration();
            const sub = await reg?.pushManager.getSubscription();
            setState(sub ? "on" : "off");
        })();
    }, []);

    const enable = async () => {
        setBusy(true);
        try {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                setState(permission === "denied" ? "denied" : "off");
                return;
            }
            const reg = await navigator.serviceWorker.register("/sw.js");
            await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!)
            });
            const json = sub.toJSON();
            const { error } = await supabase.from("push_subscriptions").upsert(
                { endpoint: sub.endpoint, p256dh: json.keys?.p256dh, auth: json.keys?.auth },
                { onConflict: "endpoint" }
            );
            setState(error ? "off" : "on");
        } catch {
            setState("off");
        } finally {
            setBusy(false);
        }
    };

    const disable = async () => {
        setBusy(true);
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        if (sub) {
            await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
            await sub.unsubscribe();
        }
        setState("off");
        setBusy(false);
    };

    if (state === "unsupported" || state === "loading") return null;

    return (
        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {state === "on" ? <Bell size={20} color="var(--primary-dark)" /> : <BellOff size={20} color="var(--text-muted)" />}
                <div>
                    <p style={{ fontWeight: 700 }}>Ilmoitukset tällä laitteella</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {state === "denied"
                            ? "Estit ilmoitukset selaimen asetuksista. Salli ne sieltä ottaaksesi ne käyttöön."
                            : "Saat heti tiedon uusista osumista ja viesteistä. iPhonessa lisää ensin CycleFound kotivalikkoon."}
                    </p>
                </div>
            </div>
            {state !== "denied" && (
                <button
                    onClick={state === "on" ? disable : enable}
                    disabled={busy}
                    className={state === "on" ? undefined : "primary-button"}
                    style={state === "on"
                        ? { padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: '#fff', fontWeight: 600 }
                        : { padding: '10px 16px' }}
                >
                    {state === "on" ? "Poista käytöstä" : "Ota käyttöön"}
                </button>
            )}
        </div>
    );
}
