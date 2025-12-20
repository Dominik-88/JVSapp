/**
 * Data areálů JVS.
 * Zdroj: JVS OPRAVA METRŮ.pdf, Kopie Kopie JVS OPRAVA METRŮ.pdf
 * * POZOR: GPS souřadnice jsou POUZE PLACEHOLDER pro vizualizaci.
 * Musí být nahrazeny přesnými daty z Google Sheets / RTK měření.
 */
export const JVS_AREALS = [
    {
        id: 'pi-amerika-ii',
        name: 'VDJ Amerika II',
        okres: 'PI',
        kategorie: 'I.',
        oploceni_bm: 293,
        vymra_m2: 3303,
        gps: [49.026710, 13.994001] // Placeholder Center
    },
    {
        id: 'st-drahonice',
        name: 'VDJ Drahonice',
        okres: 'ST',
        kategorie: 'I.',
        oploceni_bm: 376,
        vymra_m2: 5953,
        gps: [49.030000, 14.010000] // Placeholder
    },
    {
        id: 'st-vodnany',
        name: 'VDJ Vodňany',
        okres: 'ST',
        kategorie: 'I.',
        oploceni_bm: 252,
        vymra_m2: 1594,
        gps: [49.032000, 14.025000] // Placeholder
    },
    {
        id: 'cb-hlavatce',
        name: 'VDJ Hlavatce',
        okres: 'CB',
        [span_1](start_span)kategorie: null, // Bez kategorie v tabulce[span_1](end_span)
        oploceni_bm: 424,
        vymra_m2: 7968,
        gps: [49.035000, 14.040000] // Placeholder
    },
    {
        id: 'pt-sibenicni-vrch-1',
        name: 'VDJ Šibeniční vrch 1',
        okres: 'PT',
        kategorie: 'I.',
        oploceni_bm: 245,
        vymra_m2: 1835,
        gps: [49.038000, 14.055000] // Placeholder
    },
    {
        id: 'pt-uv-husinecka-prehrada',
        name: 'ÚV Husinecka přehrada',
        okres: 'PT',
        kategorie: 'I.',
        oploceni_bm: 703,
        vymra_m2: 4908,
        gps: [49.041000, 14.070000] // Placeholder
    },
    {
        id: 'pt-sibenicni-vrch-ii',
        name: 'VDJ Šibeniční vrch II',
        okres: 'PT',
        kategorie: 'I.',
        oploceni_bm: 340,
        vymra_m2: 3206,
        [span_2](start_span)// Zde jsou použity skutečné koordináty z Kopie[span_2](end_span)
        gps: [49.026710, 13.994001] 
    },
    {
        id: 'pi-zaluzany',
        name: 'VDJ Zálužany',
        okres: 'PI',
        [span_3](start_span)kategorie: null, // Bez kategorie v tabulce[span_3](end_span)
        oploceni_bm: 299,
        vymra_m2: 2350,
        gps: [49.047000, 14.100000] // Placeholder
    },
    {
        id: 'pt-ptacnik',
        name: 'VDJ Ptáčník',
        okres: 'PT',
        kategorie: 'II.',
        oploceni_bm: 239,
        vymra_m2: 1070,
        gps: [49.050000, 14.115000] // Placeholder
    },
    {
        id: 'cb-zdoba',
        name: 'VDJ Zdoba',
        okres: 'CB',
        kategorie: 'II.',
        oploceni_bm: 225,
        vymra_m2: 15523,
        gps: [49.053000, 14.130000] // Placeholder
    },
    {
        id: 'ck-domoradice',
        name: 'VDJ Domoradice',
        okres: 'CK',
        kategorie: 'I.',
        oploceni_bm: 450,
        vymra_m2: 4148,
        gps: [49.056000, 14.145000] // Placeholder
    },
    {
        id: 'ck-horni-brana',
        name: 'VDJ Horní Brána',
        okres: 'CK',
        kategorie: 'I.',
        oploceni_bm: 187,
        vymra_m2: 1665,
        gps: [49.059000, 14.160000] // Placeholder
    },
    {
        id: 'ck-netrebice',
        name: 'VDJ Netřebice',
        okres: 'CK',
        kategorie: 'I.',
        oploceni_bm: 136,
        vymra_m2: 877,
        gps: [49.062000, 14.175000] // Placeholder
    },
    {
        id: 'ck-plesivec',
        name: 'VDJ Plešivec',
        okres: 'CK',
        kategorie: 'I.',
        oploceni_bm: 119,
        vymra_m2: 975,
        gps: [49.065000, 14.190000] // Placeholder
    },
    {
        id: 'cb-doudleby',
        name: 'VDJ Doudleby',
        okres: 'CB',
        kategorie: 'II.',
        oploceni_bm: 79,
        vymra_m2: 413,
        gps: [49.068000, 14.205000] // Placeholder
    },
    {
        id: 'cb-jankov',
        name: 'VDJ Jankov',
        okres: 'CB',
        kategorie: 'I.',
        oploceni_bm: 106,
        vymra_m2: 784,
        gps: [49.071000, 14.220000] // Placeholder
    },
    {
        id: 'cb-hosin-ii',
        name: 'VDJ Hosin II',
        okres: 'CB',
        kategorie: 'I.',
        oploceni_bm: 399,
        vymra_m2: 4173,
        gps: [49.074000, 14.235000] // Placeholder
    },
    {
        id: 'cb-chlum',
        name: 'VDJ Chlum',
        okres: 'CB',
        kategorie: 'II.',
        oploceni_bm: 63,
        vymra_m2: 535,
        gps: [49.077000, 14.250000] // Placeholder
    },
    {
        id: 'cb-chotycany',
        name: 'VDJ Chotýčany',
        okres: 'CB',
        kategorie: 'II.',
        oploceni_bm: 338,
        vymra_m2: 4775,
        gps: [49.080000, 14.265000] // Placeholder
    },
    {
        id: 'cb-rudolfov-iii',
        name: 'VDJ Rudolfov III',
        okres: 'CB',
        kategorie: 'I.',
        oploceni_bm: 174,
        vymra_m2: 1868,
        gps: [49.083000, 14.280000] // Placeholder
    },
    {
        id: 'cb-rimov-vesce',
        name: 'VDJ Rimov - Vesce',
        okres: 'CB',
        kategorie: 'I.',
        oploceni_bm: 99,
        vymra_m2: 662,
        gps: [49.086000, 14.295000] // Placeholder
    },
    {
        id: 'cb-hosin',
        name: 'VDJ Hosin',
        okres: 'CB',
        kategorie: 'II.',
        oploceni_bm: 125,
        vymra_m2: 809,
        gps: [49.089000, 14.310000] // Placeholder
    },
    {
        id: 'cb-vcelna',
        name: 'VDJ Včelná',
        okres: 'CB',
        kategorie: 'II.',
        oploceni_bm: 476,
        vymra_m2: 8660,
        gps: [49.092000, 14.325000] // Placeholder
    },
    {
        id: 'cb-hury',
        name: 'VDJ Húry',
        okres: 'CB',
        kategorie: 'I.',
        oploceni_bm: 0,
        vymra_m2: 395,
        gps: [49.095000, 14.340000] // Placeholder
    },
    {
        id: 'cb-chlumec',
        name: 'VDJ Chlumec',
        okres: 'CB',
        kategorie: 'II.',
        oploceni_bm: 110,
        vymra_m2: 811,
        gps: [49.098000, 14.355000] // Placeholder
    },
    {
        id: 'cb-olesnik',
        name: 'VDJ Olešník',
        okres: 'CB',
        kategorie: 'I.',
        oploceni_bm: 117,
        vymra_m2: 380,
        gps: [49.101000, 14.370000] // Placeholder
    },
    {
        id: 'cb-cs-bukovec',
        name: 'ČS Bukovec',
        okres: 'CB',
        kategorie: 'I.',
        oploceni_bm: 300,
        vymra_m2: 4943,
        gps: [49.104000, 14.385000] // Placeholder
    },
    {
        id: 'cb-herman',
        name: 'VDJ Heřman',
        okres: 'CB',
        kategorie: 'II.',
        oploceni_bm: 119,
        vymra_m2: 982,
        gps: [49.107000, 14.400000] // Placeholder
    },
    {
        id: 'cb-cs-vidov-u-reky',
        name: 'ČS Vidov u řeky',
        okres: 'CB',
        kategorie: 'II.',
        oploceni_bm: 212,
        vymra_m2: 2501,
        gps: [49.110000, 14.415000] // Placeholder
    },
    {
        id: 'cb-vrt-vidov',
        name: 'Vrt Vidov',
        okres: 'CB',
        kategorie: 'II.',
        oploceni_bm: 164,
        vymra_m2: 470,
        gps: [49.113000, 14.430000] // Placeholder
    },
    {
        id: 'cb-uv-plav',
        name: 'ÚV Plav',
        okres: 'CB',
        kategorie: 'I.',
        oploceni_bm: 1413,
        vymra_m2: 74777,
        gps: [49.116000, 14.445000] // Placeholder
    },
    {
        id: 'ta-cekanice',
        name: 'VDJ Čekanice',
        okres: 'TA',
        kategorie: 'I.',
        oploceni_bm: 450,
        vymra_m2: 6344,
        gps: [49.119000, 14.460000] // Placeholder
    },
    {
        id: 'ta-svata-anna',
        name: 'VDJ Svatá Anna',
        okres: 'TA',
        kategorie: 'I.',
        oploceni_bm: 264,
        vymra_m2: 4192,
        gps: [49.122000, 14.475000] // Placeholder
    },
    {
        id: 'ta-bezdecin',
        name: 'VDJ Bezděčín',
        okres: 'TA',
        kategorie: 'I.',
        oploceni_bm: 169,
        vymra_m2: 1996,
        gps: [49.125000, 14.490000] // Placeholder
    },
    {
        id: 'ta-milevsko',
        name: 'VDJ Milevsko',
        okres: 'TA',
        kategorie: 'I.',
        oploceni_bm: 129,
        vymra_m2: 823,
        gps: [49.128000, 14.505000] // Placeholder
    },
    {
        id: 'ta-hodusin',
        name: 'VDJ Hodušín',
        okres: 'TA',
        kategorie: 'II.',
        oploceni_bm: 205,
        vymra_m2: 1708,
        gps: [49.131000, 14.520000] // Placeholder
    },
    {
        id: 'ta-vsechov',
        name: 'VDJ Všechov',
        okres: 'TA',
        kategorie: 'I.',
        oploceni_bm: 199,
        vymra_m2: 1574,
        gps: [49.134000, 14.535000] // Placeholder
    },
    {
        id: 'ta-zlukov',
        name: 'VDJ Zlukov',
        okres: 'TA',
        kategorie: 'II.',
        oploceni_bm: 184,
        vymra_m2: 1520,
        gps: [49.137000, 14.550000] // Placeholder
    },
    {
        id: 'ta-uv-tabor',
        name: 'ÚV Tábor',
        okres: 'TA',
        kategorie: 'II.',
        oploceni_bm: 350,
        vymra_m2: 12262,
        gps: [49.140000, 14.565000] // Placeholder
    },
    {
        id: 'ta-cs-sudomerice',
        name: 'ČS Sudoměřice',
        okres: 'TA',
        kategorie: 'I.',
        oploceni_bm: 220,
        vymra_m2: 2508,
        gps: [49.143000, 14.580000] // Placeholder
    },
    {
        id: 'ta-provozni-vodojem-tabor',
        name: 'Provozní Vodojem Tábor',
        okres: 'TA',
        kategorie: 'II.',
        oploceni_bm: 155,
        vymra_m2: 1853,
        gps: [49.146000, 14.595000] // Placeholder
    }
];
