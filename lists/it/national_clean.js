// ====================================================================
//  national_clean.js — Main list of Italian EPG sources (Phase 2)
//  Author: KritereTV (clean implementation)
//  --------------------------------------------------------------------
//  Each entry lists a fetch function and an array of channel IDs/names.
//  Currently includes: Blue.ch, RaiPlay, SamsungTVPlus.
//  Later we will add Tivù, SuperGuidaTV, Sky, Mediaset, and OggiInTV.
// ====================================================================

import fetchBlueEPG from "../../sources/it/blue_clean.js";
import fetchRaiPlayEPG from "../../sources/it/raiplay_clean.js";
import fetchSamsungEPG from "../../sources/it/samsungtvplus_clean.js";

// --------------------------------------------------------------------
// List of Italian EPG sources
// --------------------------------------------------------------------
export default {
  // 🔹 Blue.ch — Swiss/Italian hybrid source (wide coverage)
  blue: {
    fetch: fetchBlueEPG,
    channels: [348, 79, 215, 237, 266, 118] // example subset for now
  },

  // 🔹 RaiPlay — Official Rai EPG JSON API
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

  // 🔹 SamsungTVPlus — FAST channels (public JSON feed)
  samsungtvplus: {
    fetch: fetchSamsungEPG,
    // note: channel IDs are their file names on i.mjh.nz/SamsungTVPlus/it/
    channels: [
      "WarnerTV.it",
      "RadioItaliaTV.it",
      "RaiScuola.it",
      "SuperTennis.it"
    ]
  }
};


