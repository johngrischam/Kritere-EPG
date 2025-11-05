// ====================================================================
// samsungtvplus_clean.js — Fetch EPG for Samsung TV Plus (Italy)
// Clean-room version by KritereTV
// ====================================================================

import { DateTime } from "luxon";

export default async function fetchEPG(channels) {
  const epg = {};

  for (const channel of channels) {
    epg[channel] = [];
    try {
      const today = DateTime.now().setZone("Europe/Rome").startOf("day");
      const endDate = today.plus({ days: 7 }).toISODate();

      const url = `https://i.mjh.nz/SamsungTVPlus/it/${channel}.epg.json`;
      const response = await fetch(url);
      if (!response.ok) continue;

      const json = await response.json();
      for (const program of json) {
        const start = DateTime.fromISO(program.start, { zone: "Europe/Rome" });
        const end = DateTime.fromISO(program.stop, { zone: "Europe/Rome" });

        if (end.ts > today.ts) {
          epg[channel].push({
            title: program.title,
            description: program.desc,
            start: start.toISO(),
            end: end.toISO(),
            poster: program.icon || null
          });
        }
      }
    } catch (err) {
      console.error(`[SamsungTVPlus] Error fetching ${channel}:`, err);
    }
  }

  return epg;
}
