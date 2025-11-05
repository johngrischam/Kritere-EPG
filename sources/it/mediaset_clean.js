// ====================================================================
//  mediaset_clean.js — Fetch EPG from Mediaset official API
//  Clean-room implementation by KritereTV
// ====================================================================

import { DateTime } from "luxon";

const BASE_URL = "https://api.mediasetplay.mediaset.it/epg/v2";

/**
 * Fetch Mediaset EPG for one channel and one date.
 * @param {string|number} channelId
 * @param {DateTime} dateRome
 */
async function fetchDay(channelId, dateRome) {
  const dateStr = dateRome.toFormat("yyyy-MM-dd");
  const url = `${BASE_URL}/${channelId}?date=${dateStr}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`⚠️ Mediaset ${channelId} ${dateStr}: ${res.status}`);
      return [];
    }

    const json = await res.json();
    const programs = [];

    for (const ev of json?.events || []) {
      const start = DateTime.fromISO(ev.start, { zone: "Europe/Rome" });
      const end = DateTime.fromISO(ev.end, { zone: "Europe/Rome" });
      if (!start.isValid || !end.isValid) continue;

      programs.push({
        title: ev.title || "Senza titolo",
        description: ev.description || "",
        start: start.toISO(),
        end: end.toISO(),
        poster: ev.image || null
      });
    }

    return programs;
  } catch (err) {
    console.error(`❌ Mediaset ${channelId} ${dateStr}: ${err.message}`);
    return [];
  }
}

/**
 * Main entry: fetch 7-day schedule for multiple Mediaset channels.
 * @param {(string|number)[]} channels
 * @returns {Promise<Object[]>}
 */
export default async function fetchMediasetEPG(channels) {
  const results = [];
  const today = DateTime.now().setZone("Europe/Rome").startOf("day");

  for (const id of channels) {
    const all = [];
    for (let i = 0; i < 7; i++) {
      const date = today.plus({ days: i });
      const daily = await fetchDay(id, date);
      all.push(...daily);
    }

    results.push({
      id: String(id),
      name: `Mediaset ${id}`,
      programs: all
    });

    console.log(`✅ Mediaset ${id}: ${all.length} programs`);
  }

  return results;
}
