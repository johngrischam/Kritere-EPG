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
  // --- Blue.ch: all main FTA & national channels ---
  blue: {
    fetch: fetchBlueEPG,
    channels: [1287, 1123, 348, 79, 215, 237, 266, 118, 332, 334],
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
      // Sky Entertainment & Cinema
      102, 104, 105, 106, 107, 108, 109, 110,
      111, 112, 113, 114, 115, 116, 117, 118, 119,

      // Eurosport & other Sky sports
      141, 142, 145, 146, 147, 148, 149,
    ],
  },
};
