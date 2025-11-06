// ====================================================================
//  national_clean.js — Minimal Italian EPG sources (Phase 8 - KritereTV)
//  Author: KritereTV (Blue.ch + SamsungTV + SuperGuidaTV for Sky)
// ====================================================================

import fetchBlueEPG from "../../sources/it/blue_clean.js";
import fetchSamsungEPG from "../../sources/it/samsungtvplus_clean.js";
import fetchSuperGuidaEPG from "../../sources/it/superguidatv_clean.js";

// --------------------------------------------------------------------
// Unified list of Italian EPG sources (3 total, simplified)
// --------------------------------------------------------------------
export default {
  // --- Blue.ch: all FTA & national channels merged (A+B+C) ---
  blue: {
    fetch: fetchBlueEPG,
    channels: [
      2064, 2015, 1948, 1665, 1386,
      1379, 1346, 1287, 613, 393, 357,
      356, 348, 346, 338, 334, 332, 329, 328, 327, 266,
      257, 243, 239, 237, 216, 215, 214, 191,
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
    channels: [1], // Sky Uno
  },
};

