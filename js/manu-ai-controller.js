/**
 * js/manu-ai-controller.js
 * Řídí logiku a znalostní bázi pro vestavěného asistenta Barbieri e-ManuAI.
 * Založeno na textu ze souboru 'text 2.txt' a rozšířeno o technické specifikace.
 */

import { showToast } from './app.js';

// --- ZNALOSTNÍ BÁZE (KB) ---
// Klíčová slova: 'k', Odpovědi: 'a'
const KB = [
    {
        k: ['olej', 'motorový olej', 'výměna oleje'],
        a: 'Motor Barbieri XROT 95 EVO vyžaduje pravidelnou kontrolu a výměnu motorového oleje. Použijte kvalitní syntetický olej 10W-30 nebo 5W-40, jak je specifikováno v manuálu. Doporučený interval výměny je každých 100 motohodin.'
    },
    {
        k: ['chyba', 'error', 'porucha', 'servis'],
        a: 'Pokud se na displeji objeví kód chyby, neprodleně zastavte stroj a zkontrolujte VIBRO ALERT systém na dálkovém ovladači. Většina chyb vyžaduje restart nebo kontrolu stavu baterií/paliva. Pro závažné chyby kontaktujte servisní středisko MALCOM CZ.'
    },
    {
        k: ['svah', 'sklon', 'maximální sklon', 'strmost'],
        a: 'Stroj XROT 95 EVO je navržen pro extrémní terén. Maximální svahová dostupnost je **45° (100 % sklon)** díky nízkému těžišti a elektrohydraulickému pohonu. Vždy pracujte s lanem na svazích nad 35° pro absolutní bezpečnost.'
    },
    {
        k: ['rtk', 'gps', 'přesnost', 'navigace'],
        a: 'Stroj je vybaven RTK GPS systémem u-blox ZED-F9P pro **centimetrovou přesnost (1-2 cm)**. Pro RTK FIXED připojení je nutné stabilní internetové připojení a přihlášení k NTRIP službě (např. CZEPOS) s údaji Host: rtk.cuzk.cz, Port: 2101.'
    },
    {
        k: ['baterie', 'nabíjení', 'akumulátor'],
        a: 'XROT používá 48V bateriový systém pro elektromotory. Pravidelně kontrolujte stav nabití a ujistěte se, že baterie nejsou vystaveny extrémním teplotám. Udržujte kontakty čisté.'
    },
    {
        k: ['sečení', 'šířka', 'nože'],
        a: 'Pracovní šířka žacího ústrojí je **95 cm**. Má mulčovací systém se zadním výhozem (2 kyvné + 2 pevné nože). Výška sečení je dálkově nastavitelná v rozsahu 30 – 150 mm.'
    },
    {
        k: ['výkon', 'motor', 'koňská síla'],
        a: 'Motor Kawasaki FS730V EFI (2-válec, 4-taktní) má výkon **17,2 kW (23 HP)** a krouticí moment 54,3 Nm.'
    }
];

// --- HLAVNÍ CHAT FUNKCE ---

/**
 * Inicializuje posluchače událostí pro chatovací rozhraní.
 */
export function initializeManuAIChat() {
    const chatInputEl = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');

    if (chatInputEl && chatSendBtn) {
        // Navěšení logiky na tlačítko Odeslat
        chatSendBtn.addEventListener('click', sendChat);
        // Navěšení logiky na klávesu Enter
        chatInputEl.addEventListener('keypress', handleChat);
        
        // Úvodní zpráva od bota
        const body = document.getElementById('chat-body');
        if (body && body.children.length === 0) {
            body.innerHTML = '<div class="msg bot">Ahoj! Jsem e-ManuAI, tvůj asistent pro Barbieri XROT 95 EVO. Zeptej se na cokoliv ohledně stroje.</div>';
        }
    }
}

/**
 * Zpracuje stisk klávesy Enter.
 */
function handleChat(e) {
    if (e.key === 'Enter') {
        sendChat();
    }
}

/**
 * Odešle zprávu uživatele a zobrazí odpověď bota.
 */
function sendChat() {
    const inp = document.getElementById('chat-input');
    const val = inp.value.trim().toLowerCase();
    
    if (!val) return;

    const body = document.getElementById('chat-body');
    
    // 1. Zobraz zprávu uživatele
    body.innerHTML += `<div class="msg user">${inp.value}</div>`;
    inp.value = ''; // Vyčisti input
    
    // 2. Najdi odpověď
    const found = KB.find(x => x.k.some(k => val.includes(k)));
    const ans = found ? found.a : 'Nerozumím. Zkuste prosím použít jedno klíčové slovo, např. **olej**, **chyba**, **svah**, nebo **rtk**.';
    
    // 3. Zobraz odpověď bota s malým zpožděním pro efekt
    setTimeout(() => {
        body.innerHTML += `<div class="msg bot">${ans}</div>`;
        // Scroll na konec chatu
        body.scrollTop = body.scrollHeight;
    }, 500);
}