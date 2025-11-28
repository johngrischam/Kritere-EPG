// ====================================================================
//  national_clean.js — Minimal Italian EPG sources (Phase 8 - KritereTV)
//  Author: KritereTV (Blue.ch split + SamsungTV + SuperGuidaTV for Sky)
// ====================================================================

import fetchBlueEPG from "../../sources/it/blue_clean.js";
import fetchSamsungEPG from "../../sources/it/samsungtvplus_clean.js";
import fetchSuperGuidaEPG from "../../sources/it/superguidatv_clean.js";

// --------------------------------------------------------------------
// Unified list of Italian EPG sources (3 total, with Blue split in 3)
// --------------------------------------------------------------------
export default {
  // --- Blue.ch Group A ---
  blue_a: {
    fetch: fetchBlueEPG,
    channels: [
      2064, 2015, 1948, 1665, 1386,
      1379, 1346, 1287, 613, 393, 357, 340
    ],
  },

  // --- Blue.ch Group B ---
  blue_b: {
    fetch: fetchBlueEPG,
    channels: [
      356, 348, 346, 338, 337, 336, 334,
      332, 330, 329, 328, 327, 266
    ],
  },

  // --- Blue.ch Group C ---
  blue_c: {
    fetch: fetchBlueEPG,
    channels: [
      257, 243, 239,
      237, 216, 215, 214, 191,
      118, 96, 79, 51
    ],
  },

  // --- SamsungTVPlus: all FAST / streaming channels ---
  samsungtvplus: {
    fetch: fetchSamsungEPG,
    channels: ["*"], // expands automatically from XML
  },

  // --- SuperGuidaTV: Sky / Pay-TV channels only ---
  superguidatv: {
  fetch: fetchSuperGuidaEPG,
  channels: [
    102, 105, 106, 107, 108, 109, 110, 111,
    112, 113, 114, 115, 116, 117, 145, 146,
    584, 585
  ]
},
};

