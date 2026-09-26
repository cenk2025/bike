"use client";

import { useEffect } from "react";

/** Registers the service worker (offline page + push notifications). */
export default function PwaRegister() {
    useEffect(() => {
        if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
            navigator.serviceWorker.register("/sw.js").catch(() => { /* not critical */ });
        }
    }, []);
    return null;
}
