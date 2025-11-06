// ====================================================================
//  national_clean.js — Main list of Italian EPG sources (Phase 7)
//  Author: KritereTV (clean implementation)
// ====================================================================

import fetchBlueEPG from "../../sources/it/blue_clean.js";
import fetchRaiPlayEPG from "../../sources/it/raiplay_clean.js";
import fetchSamsungEPG from "../../sources/it/samsungtvplus_clean.js";
import fetchTivuEPG from "../../sources/it/tivu_clean.js";
import fetchSuperGuidaEPG from "../../sources/it/superguidatv_clean.js";
import fetchSkyEPG from "../../sources/it/sky_clean.js";
import fetchMediasetEPG from "../../sources/it/mediaset_clean.js";
import fetchOggiInTVEPG from "../../sources/it/oggiintv_clean.js";

// --------------------------------------------------------------------
// Unified list of Italian EPG sources (8 total)
// --------------------------------------------------------------------
export default {
  blue: { fetch: fetchBlueEPG, channels: [1287, 1123, 348, 79, 215, 237, 266, 118, 332, 334] },

  raiplay: {
    fetch: fetchRaiPlayEPG,
    channels: [
      "rai-1",
      "rai-2",
      "rai-3",
      "rai-4",
      "rai-5",
      "rai-news-24",
      "rai-sport",
      "rai-movie",
      "rai-gulp",
    ],
  },

  samsungtvplus: {
  fetch: fetchSamsungEPG,
  channels: ["*"],   // expands to every <programme channel="..."> id
},

  tivu: { fetch: fetchTivuEPG, channels: [130, 136, 255] },

  superguidatv: {
  fetch: fetchSuperGuidaEPG,
  channels: [
    // --- Rai ---
    8,   // Rai 1
    10,  // Rai 2
    12,  // Rai 3
    14,  // Rai 4
    16,  // Rai 5
    18,  // Rai Movie
    20,  // Rai Premium
    22,  // Rai Gulp
    24,  // Rai Yoyo
    26,  // Rai News 24
    28,  // Rai Sport

    // --- Mediaset ---
    30,  // Canale 5
    32,  // Italia 1
    34,  // Rete 4
    36,  // 20 Mediaset
    38,  // Iris
    40,  // La5
    42,  // Mediaset Extra
    44,  // Focus
    46,  // Top Crime
    48,  // Cine34
    50,  // TGCom24

    // --- Sky / Pay-TV ---
    102,  // Sky Uno
    104,  // Sky Atlantic
    105,  // Sky Cinema Uno
    106,  // Sky Cinema Due
    107,  // Sky Cinema Collection
    108,  // Sky Cinema Family
    109,  // Sky Cinema Action
    110,  // Sky Cinema Comedy
    111,  // Sky Cinema Romance
    112,  // Sky Cinema Drama
    113,  // Sky Sport 24
    114,  // Sky Sport Uno
    115,  // Sky Sport Calcio
    116,  // Sky Sport Arena
    117,  // Sky Sport Tennis
    118,  // Sky TG24
    119,  // Sky Arte

    // --- Discovery & free channels ---
    121,  // Real Time
    122,  // Nove
    123,  // DMAX
    124,  // MotorTrend
    125,  // Food Network
    126,  // HGTV - Home & Garden TV
    127,  // Giallo
    128,  // K2
    129,  // Frisbee
    130,  // Boing
    131,  // Cartoonito
    132,  // Super!
    133,  // Paramount Network (now Pluto TV Cinema)
    134,  // TV8
    135,  // Cielo
    136,  // La7
    137,  // La7d
    138,  // TV2000
    139,  // SuperTennis TV
    140,  // Radio Italia TV
    
    // --- Rai ---
    28,  // Rai Sport

    // --- Sky Sport bouquet ---
    113, // Sky Sport 24
    114, // Sky Sport Uno
    115, // Sky Sport Calcio
    116, // Sky Sport Arena
    117, // Sky Sport Tennis
    118, // Sky TG24 (sports/news hybrid)

    // --- Eurosport ---
    141, // Eurosport 1
    142, // Eurosport 2

    // --- Motor & outdoor ---
    124, // MotorTrend
    145, // Sky Sport MotoGP
    146, // Sky Sport F1

    // --- Tennis & other federations ---
    139, // SuperTennis TV

    // --- Other Italian sports feeds ---
    147, // Sportitalia
    148, // Sportitalia 2
    149, // Sportitalia Live
  ],
},

  sky: {
    fetch: fetchSkyEPG,
    channels: [9115, 477, 501, 102, 108, 109, 110],
  },

  mediaset: {
    fetch: fetchMediasetEPG,
    channels: [
      "canale5",
      "italia1",
      "rete4",
      "20",
      "la5",
      "topcrime",
      "iris",
      "cine34",
      "focus",
      "extra",
      "tgcom24",
    ],
  },

  oggiintv: {
    fetch: fetchOggiInTVEPG,
    channels: [
      "tv8",
      "real-time",
      "cielo",
      "giallo",
      "motortrend",
      "nove",
      "la7d",
      "twentyseven",
    ],
  },
};

