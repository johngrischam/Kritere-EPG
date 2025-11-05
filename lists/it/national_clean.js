// ====================================================================
//  national_clean.js — Main list of Italian EPG sources (Phase 3)
//  Author: KritereTV (clean implementation)
// ====================================================================

import fetchBlueEPG from "../../sources/it/blue_clean.js";
import fetchRaiPlayEPG from "../../sources/it/raiplay_clean.js";
import fetchSamsungEPG from "../../sources/it/samsungtvplus_clean.js";
import fetchTivuEPG from "../../sources/it/tivu_clean.js";

// --------------------------------------------------------------------
// List of Italian EPG sources
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
    channels: [130, 136, 255] // example Tivùsat IDs
  }
};


