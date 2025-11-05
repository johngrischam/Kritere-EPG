// ====================================================================
//  superguidatv_clean.js — Fetch EPG from SuperGuidaTV public API
//  Clean-room implementation by KritereTV
// ====================================================================

import { DateTime } from "luxon";

const BASE_URL = "https://guidatv-api.superguidatv.it/programmi";

/**
 * Fetch one day's schedule for a SuperGuidaTV channel.
 * @param {number|string} channelId
 * @param {DateTime} dateRome
 */
async function fetchDay(channelId, dateRome) {
  const dateStr = dateRome.toFormat("yyyy-MM-dd");
  const url = `${BASE_URL}/${channelId}?data=${dateStr}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`⚠️ SuperGuidaTV ${channelId} ${dateStr}: ${res.status}`);
      return [];
    }

    const json = await res.json();
    const programs = [];

    for (const p of json || []) {
      const start = DateTime.fromISO(p.data_inizio, { zone: "Europe/Rome" });
      const end = DateTime.fromISO(p.data_fine, { zone: "Europe/Rome" });
      if (!start.isValid || !end.isValid) continue;

      programs.push({
        title: p.titolo || "Senza titolo",
        description: p.descrizione || "",
        start: start.toISO(),
        end: end.toISO(),
        poster: p.locandina || null
      });
    }

    return programs;
  } catch (err) {
    console.error(`❌ SuperGuidaTV ${channelId} ${dateStr}: ${err.message}`);
    return [];
  }
}

/**
 * Main entry for multiple SuperGuidaTV channels.
 * @param {(number|string)[]} channels
 * @returns {Promise<Object[]>}
 */
export default async function fetchSuperGuidaEPG(channels) {
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
      name: `SuperGuidaTV ${id}`,
      programs: all
    });

    console.log(`✅ SuperGuidaTV ${id}: ${all.length} programs`);
  }

  return results;
}
