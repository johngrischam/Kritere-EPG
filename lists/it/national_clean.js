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
    8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28,

    // --- Mediaset ---
    30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50,

    // --- Sky / Pay-TV ---
    102, 104, 105, 106, 107, 108, 109, 110,
    111, 112, 113, 114, 115, 116, 117, 118, 119,

    // --- Discovery & free channels ---
    121, 122, 123, 124, 125, 126, 127, 128,
    129, 130, 131, 132, 133, 134, 135, 136,
    137, 138, 139, 140,

    // --- Eurosport & sport bouquet ---
    141, 142, 145, 146, 147, 148, 149,
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

