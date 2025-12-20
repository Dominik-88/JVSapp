# 🚰 JVS Management System - Modular PWA

Kompletní Progressive Web Application (PWA) pro správu a údržbu vodárenských areálů Jihočeského vodárenského svazu. Aplikace zajišťuje mapovou vizualizaci **41 areálů**, plánování tras a podporu pro práci v terénu, včetně podpory pro **offline režim**.

## 🎯 Cíl Refaktoringu

Původní monolitický HTML kód byl refaktorován do čisté, modulární a dlouhodobě udržitelné struktury GitHub repozitáře. Bylo zachováno 100% funkčnosti a významu původních dat.

## ⚙️ Architektura a Technické Principyy

Projekt striktně dodržuje principy PWA a modularity ES6+.

* **Progressive Web Application (PWA):** Zahrnuje soubory `manifest.json` a `sw.js` (Service Worker) pro zajištění spolehlivosti a podpory **Offline-First** přístupu, nezávisle na kvalitě mobilního signálu v terénu.
* **Modularita (ES6+):** Kód je rozdělen do modulů (např. `js/data.js`, `js/map-controller.js`), kde každý soubor má jedinou jasnou odpovědnost (`1 soubor = 1 odpovědnost`).
* **Technologie:** HTML5, CSS3, ES6+, knihovny **Leaflet** (mapy) a **Font Awesome** (ikony) načítané z CDN.
* **Struktura:** Využívá kebab-case pro soubory/složky a camelCase pro JS proměnné a funkce.

## 📋 Klíčové funkce

| Ikona | Funkce | Popis |
| :---: | :--- | :--- |
| 🗺️ | **Mapová vizualizace** | Interaktivní mapa s 41 přesně umístěnými areály (dle lat/lon) s detailními a interaktivními popupy pro rychlé akce (Navigovat, Hotovo, Do trasy). |
| 🔎 | **Filtrování a vyhledávání** | Flexibilní filtrování areálů podle názvu, **Okresu** (CB, TA, PT atd.) a **Kategorie** (I., II.) s okamžitou aktualizací statistik. |
| 🛣️ | **Plánovač trasy** | Modul pro sběr a správu areálů pro plánovanou trasu s možností navigace. |
| 🤖 | **Claude AI Asistent (Puter.js)** | Implementace **online, 24/7 AI asistenta** (např. Claude Sonnet 4.5/Opus 4.5) pro pomoc s plánováním, počítáním, reportováním a navigováním v reálném čase. Využívá *User-Pays* model bez potřeby API klíčů na straně vývojáře. |
| 📊 | **Statistický přehled** | Okamžitý souhrn počtu areálů a celkové výměry (m²) dle aktuálně nastavených filtrů. |

## 🚀 Lokální spuštění

Pro spuštění a testování aplikace lokálně, které nevyžaduje žádný build krok, postupujte následovně:

1.  **Klonování repozitáře:**
    ```bash
    git clone <ADRESA_VAŠEHO_GITHUB_REPA>
    cd jvs-management-system
    ```
2.  **Spuštění:**
    Otevřete `index.html` v moderním prohlížeči. **Pro testování PWA (Service Worker) je nutné aplikaci spustit přes lokální webový server** (např. *Live Server* pro VS Code, nebo `python -m http.server`).

## 📄 Referenční materiály

* **Datasety areálů:** Data o 41 areálech (název, výměra, oplocení, okres, kategorie, GPS) jsou uložena v `js/data.js`. Tato data jsou nezměněná oproti původnímu kódu (viz `JVS OPRAVA METRŮ.pdf`).
* **Technická dokumentace:** Zohledňuje manuál pro Barbieri XRot 95 EVO (GPS/RTK, telemetrie) pro budoucí integraci strojových dat.

---
*Tento repozitář je určen k iterativnímu nasazení a dlouhodobé údržbě.*
