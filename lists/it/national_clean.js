// ====================================================================
//  national_clean.js — Main list of Italian EPG sources (Phase 5)
//  Author: KritereTV (clean implementation)
// ====================================================================

import fetchBlueEPG from "../../sources/it/blue_clean.js";
import fetchRaiPlayEPG from "../../sources/it/raiplay_clean.js";
import fetchSamsungEPG from "../../sources/it/samsungtvplus_clean.js";
import fetchTivuEPG from "../../sources/it/tivu_clean.js";
import fetchSuperGuidaEPG from "../../sources/it/superguidatv_clean.js";
import fetchSkyEPG from "../../sources/it/sky_clean.js";

// --------------------------------------------------------------------
// Unified list of Italian EPG sources
// --------------------------------------------------------------------
export default {
  blue: {
    fetch: fetchBlueEPG,
    channels: [348, 79, 215, 237, 266, 118]
  },

  raiplay: {
    fetch: fetchRaiPlayEPG,
    channels: [
      "rai-1",
      "rai-2",
      "rai-3",
      "rai-4",
      "rai-5",
      "rai-news-24",
      "rai-sport"
    ]
  },

  samsungtvplus: {
    fetch: fetchSamsungEPG,
    channels: [
      "WarnerTV.it",
      "RadioItaliaTV.it",
      "RaiScuola.it",
      "SuperTennis.it"
    ]
  },

  tivu: {
    fetch: fetchTivuEPG,
    channels: [130, 136, 255]
  },

  superguidatv: {
    fetch: fetchSuperGuidaEPG,
    channels: [8, 10, 12, 14, 20] // Italia 1, Rete 4, La7, TV8, 20 Mediaset
  },

  sky: {
    fetch: fetchSkyEPG,
    channels: [501, 102, 108, 109, 110] // e.g. Sky TG24, Sky Uno, Sky Cinema
  }
};

