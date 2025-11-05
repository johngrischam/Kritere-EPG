// ====================================================================
//  national_clean.js — Main list of Italian EPG sources (phase 1)
//  Author: KritereTV (clean implementation)
//  --------------------------------------------------------------------
//  Each entry lists a fetch function and an array of channel IDs/names.
//  Later we will add SamsungTVPlus, Tivù, SuperGuidaTV, Sky, Mediaset,
//  and OggiInTV.
// ====================================================================

import fetchBlueEPG from "../../sources/it/blue_clean.js";
import fetchRaiPlayEPG from "../../sources/it/raiplay_clean.js";

// --------------------------------------------------------------------
// For now, include only Blue.ch and RaiPlay.
// --------------------------------------------------------------------
export default {
  blue: {
    fetch: fetchBlueEPG,
    channels: [348, 79, 215, 237, 266, 118] // a few sample Blue IDs
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
  }
};

