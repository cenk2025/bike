// App-only strings. Everything else comes from the website's shared
// dictionary (../../../src/i18n/dictionaries.ts) so wording stays consistent.

const fi = {
    "tab.search": "Etsi",
    "tab.map": "Kartta",
    "tab.report": "Ilmoita",
    "tab.profile": "Profiili",

    "m.searchPlaceholder": "Merkki, malli, kaupunki tai sarjanumero",
    "m.homeTitle": "Löydä pyöräsi",
    "m.found": "Löysin pyörän",
    "m.check": "Tarkista sarjanumero",
    "m.sponsored": "Sponsoroitu",
    "m.readMore": "Lue lisää",
    "m.error": "Jokin meni pieleen. Yritä uudelleen.",
    "m.retry": "Yritä uudelleen",
    "m.ok": "OK",
    "m.cancel": "Peruuta",
    "m.done": "Valmis",

    "m.reportTitle": "Mitä haluat ilmoittaa?",
    "m.reportFoundText": "Ilmoita löytämäsi pyörä – käyttäjätiliä ei tarvita.",
    "m.loginNeeded": "Vaatii kirjautumisen",
    "m.takePhoto": "Ota kuva",
    "m.pickPhoto": "Valitse kuvista",
    "m.photoHint": "Sijaintitiedot poistetaan kuvista automaattisesti.",
    "m.date": "Päivämäärä",
    "m.savedStolen": "Ilmoitus tallennettu. Vertaamme sitä jatkuvasti uusiin löytöilmoituksiin ja kerromme heti, jos osuma löytyy.",
    "m.savedRegister": "Pyörä rekisteröity. Jos se katoaa, voit ilmoittaa sen varastetuksi yhdellä napautuksella.",
    "m.seeMyBikes": "Omat pyörät",

    "m.authReason": "Kirjaudu sisään tehdäksesi ilmoituksen. Löytöilmoituksen voi tehdä ilman tiliä.",
    "m.checkEmail": "Tarkista sähköpostisi ja vahvista tili. Kirjaudu sen jälkeen sisään.",

    "m.guestTitle": "Tervetuloa BikeBackiin",
    "m.guestText": "Kirjaudu nähdäksesi pyöräsi, automaattiset osumat ja viestit.",
    "m.language": "Kieli",
    "m.info": "Tietoa",
    "m.deleteAccount": "Poista tili",
    "m.deleteConfirm": "Tili ja kaikki ilmoituksesi poistetaan pysyvästi. Jatketaanko?",
    "m.deleted": "Tili on poistettu.",
    "m.noMatches": "Ei osumia vielä. Ilmoitamme heti, kun löytöilmoitus vastaa pyörääsi.",
    "m.cityReports": "{n} ilmoitusta",
    "m.quick": "Pikatoiminnot",
    "m.stolen": "Pyöräni varastettiin",
    "m.type": "Tyyppi",
    "m.color": "Väri",
    "m.city": "Kaupunki",
    "m.reported": "Ilmoitettu",
    "m.contact": "Ota yhteyttä"
};

export type MobileKey = keyof typeof fi;
type Strings = Record<MobileKey, string>;

const sv: Strings = {
    "tab.search": "Sök",
    "tab.map": "Karta",
    "tab.report": "Anmäl",
    "tab.profile": "Profil",

    "m.searchPlaceholder": "Märke, modell, stad eller serienummer",
    "m.homeTitle": "Hitta din cykel",
    "m.found": "Jag hittade en cykel",
    "m.check": "Kontrollera serienummer",
    "m.sponsored": "Sponsrat",
    "m.readMore": "Läs mer",
    "m.error": "Något gick fel. Försök igen.",
    "m.retry": "Försök igen",
    "m.ok": "OK",
    "m.cancel": "Avbryt",
    "m.done": "Klar",

    "m.reportTitle": "Vad vill du anmäla?",
    "m.reportFoundText": "Anmäl en cykel du hittat – inget konto behövs.",
    "m.loginNeeded": "Kräver inloggning",
    "m.takePhoto": "Ta foto",
    "m.pickPhoto": "Välj från bilder",
    "m.photoHint": "Platsuppgifter tas automatiskt bort från bilderna.",
    "m.date": "Datum",
    "m.savedStolen": "Anmälan sparad. Vi jämför den hela tiden med nya fyndanmälningar och meddelar dig direkt vid en träff.",
    "m.savedRegister": "Cykeln är registrerad. Om den försvinner kan du anmäla den stulen med ett tryck.",
    "m.seeMyBikes": "Mina cyklar",

    "m.authReason": "Logga in för att göra en anmälan. En fyndanmälan kan göras utan konto.",
    "m.checkEmail": "Kontrollera din e-post och bekräfta kontot. Logga sedan in.",

    "m.guestTitle": "Välkommen till BikeBack",
    "m.guestText": "Logga in för att se dina cyklar, automatiska träffar och meddelanden.",
    "m.language": "Språk",
    "m.info": "Information",
    "m.deleteAccount": "Radera konto",
    "m.deleteConfirm": "Kontot och alla dina anmälningar raderas permanent. Fortsätta?",
    "m.deleted": "Kontot har raderats.",
    "m.noMatches": "Inga träffar ännu. Vi meddelar dig direkt när en fyndanmälan motsvarar din cykel.",
    "m.cityReports": "{n} anmälningar",
    "m.quick": "Snabbval",
    "m.stolen": "Min cykel blev stulen",
    "m.type": "Typ",
    "m.color": "Färg",
    "m.city": "Stad",
    "m.reported": "Anmäld",
    "m.contact": "Kontakta"
};

const en: Strings = {
    "tab.search": "Search",
    "tab.map": "Map",
    "tab.report": "Report",
    "tab.profile": "Profile",

    "m.searchPlaceholder": "Brand, model, city or serial number",
    "m.homeTitle": "Find your bike",
    "m.found": "I found a bike",
    "m.check": "Check serial number",
    "m.sponsored": "Sponsored",
    "m.readMore": "Read more",
    "m.error": "Something went wrong. Please try again.",
    "m.retry": "Try again",
    "m.ok": "OK",
    "m.cancel": "Cancel",
    "m.done": "Done",

    "m.reportTitle": "What would you like to report?",
    "m.reportFoundText": "Report a bike you found – no account needed.",
    "m.loginNeeded": "Requires login",
    "m.takePhoto": "Take photo",
    "m.pickPhoto": "Choose from photos",
    "m.photoHint": "Location data is removed from photos automatically.",
    "m.date": "Date",
    "m.savedStolen": "Report saved. We keep comparing it with new found reports and tell you right away when there's a match.",
    "m.savedRegister": "Bike registered. If it goes missing, you can report it stolen with one tap.",
    "m.seeMyBikes": "My bikes",

    "m.authReason": "Log in to make a report. A found report can be made without an account.",
    "m.checkEmail": "Check your email and confirm your account, then log in.",

    "m.guestTitle": "Welcome to BikeBack",
    "m.guestText": "Log in to see your bikes, automatic matches and messages.",
    "m.language": "Language",
    "m.info": "Information",
    "m.deleteAccount": "Delete account",
    "m.deleteConfirm": "Your account and all your reports will be deleted permanently. Continue?",
    "m.deleted": "Your account has been deleted.",
    "m.noMatches": "No matches yet. We'll tell you as soon as a found report matches your bike.",
    "m.cityReports": "{n} reports",
    "m.quick": "Quick actions",
    "m.stolen": "My bike was stolen",
    "m.type": "Type",
    "m.color": "Colour",
    "m.city": "City",
    "m.reported": "Reported",
    "m.contact": "Get in touch"
};

export const MOBILE_STRINGS = { fi, sv, en };
