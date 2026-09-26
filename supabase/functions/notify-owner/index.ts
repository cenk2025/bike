// Supabase Edge Function: e-mails the right person when
//   * a new row is inserted into bike_matches  -> owner of the lost bike
//   * a new row is inserted into bike_messages -> owner of the bike, or the
//     anonymous finder (bikes.finder_email) for found reports.
//
// Deploy:
//   supabase functions deploy notify-owner --no-verify-jwt
//   supabase secrets set RESEND_API_KEY=... WEBHOOK_SECRET=... \
//       MAIL_FROM="CycleFound <noreply@voon.fi>" SITE_URL=https://bike.voon.fi
// Then in Supabase: Database -> Webhooks -> create two webhooks (INSERT on
// public.bike_matches and INSERT on public.bike_messages) pointing to this
// function's URL, with an HTTP header  x-webhook-secret: <WEBHOOK_SECRET>.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://bike.voon.fi";
const MAIL_FROM = Deno.env.get("MAIL_FROM") ?? "CycleFound <noreply@voon.fi>";

const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

type Bike = {
    id: string;
    brand: string | null;
    model: string | null;
    city: string | null;
    location: string | null;
    user_id: string | null;
    allow_contact: boolean | null;
    contact_email: string | null;
    finder_email: string | null;
};

const esc = (s: string) =>
    s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const title = (b: Bike) => [b.brand, b.model].filter(Boolean).join(" ") || "pyöräsi";

async function getBike(id: string): Promise<Bike | null> {
    const { data } = await admin
        .from("bikes")
        .select("id, brand, model, city, location, user_id, allow_contact, contact_email, finder_email")
        .eq("id", id)
        .maybeSingle();
    return data as Bike | null;
}

// Owner opted in to notifications -> contact_email, else the login e-mail.
async function ownerEmail(bike: Bike): Promise<string | null> {
    if (!bike.user_id || bike.allow_contact === false) return null;
    if (bike.contact_email) return bike.contact_email;
    const { data } = await admin.auth.admin.getUserById(bike.user_id);
    return data.user?.email ?? null;
}

async function sendMail(to: string, subject: string, html: string, replyTo?: string) {
    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ from: MAIL_FROM, to, subject, html, reply_to: replyTo })
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

Deno.serve(async req => {
    if (req.headers.get("x-webhook-secret") !== Deno.env.get("WEBHOOK_SECRET")) {
        return new Response("forbidden", { status: 403 });
    }

    const payload = await req.json();
    if (payload.type !== "INSERT") return new Response("ignored");
    const record = payload.record;

    try {
        if (payload.table === "bike_matches") {
            const [lost, found] = await Promise.all([getBike(record.lost_bike_id), getBike(record.found_bike_id)]);
            if (!lost || !found) return new Response("missing bike");
            const to = await ownerEmail(lost);
            if (!to) return new Response("owner not notified");

            await sendMail(
                to,
                `CycleFound: mahdollinen osuma – ${title(lost)}`,
                `<p>Hei!</p>
                 <p>Joku ilmoitti löytäneensä pyörän, joka vastaa pyörääsi <b>${esc(title(lost))}</b>
                 (${esc(found.location || found.city || "sijainti tuntematon")}).</p>
                 <p>Osuman perusteet: ${esc((record.reasons ?? []).join(", "))}.</p>
                 <p><a href="${SITE_URL}/dashboard">Katso osuma ja ota yhteyttä löytäjään</a></p>`
            );
        } else if (payload.table === "bike_messages") {
            const bike = await getBike(record.bike_id);
            if (!bike) return new Response("missing bike");
            const to = bike.user_id ? await ownerEmail(bike) : bike.finder_email;
            if (!to) return new Response("no recipient");

            await sendMail(
                to,
                `CycleFound: uusi viesti – ${title(bike)}`,
                `<p>Hei!</p>
                 <p><b>${esc(record.sender_name)}</b> lähetti viestin koskien pyörää <b>${esc(title(bike))}</b>:</p>
                 <blockquote>${esc(record.body).replace(/\n/g, "<br>")}</blockquote>
                 <p>Vastaa suoraan tähän sähköpostiin${record.sender_phone ? ` tai soita ${esc(record.sender_phone)}` : ""}.</p>
                 <p>Turvallisuus: älä maksa etukäteen, tapaa julkisella paikalla ja pyydä todiste omistajuudesta.</p>
                 ${bike.user_id ? `<p><a href="${SITE_URL}/dashboard">Avaa CycleFound</a></p>` : ""}`,
                record.sender_email
            );
        }
    } catch (err) {
        console.error(err);
        return new Response("mail failed", { status: 500 });
    }

    return new Response("ok");
});
