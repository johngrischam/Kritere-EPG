// ====================================================================
//  tivu_clean.js — Fetch EPG from guidatv.tivu.tv (Tivùsat / DTT)
//  Clean-room implementation by KritereTV
// ====================================================================

import { DateTime } from "luxon";

const BASE_URL = "https://guidatv.tivu.tv/api/epg/programs";

/**
 * Fetch one day's schedule for a given Tivù channel ID.
 */
async function fetchDay(channelId, dateRome) {
  const dateStr = dateRome.toFormat("yyyy-MM-dd");
  const url = `${BASE_URL}?cid=${channelId}&date=${dateStr}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`⚠️ Tivù ${channelId} day ${dateStr}: ${res.status}`);
      return [];
    }

    const json = await res.json();
    const programs = [];

    for (const p of json || []) {
      const start = DateTime.fromISO(p.startTime, { zone: "Europe/Rome" });
      const end = DateTime.fromISO(p.endTime, { zone: "Europe/Rome" });
      if (!start.isValid || !end.isValid) continue;

      programs.push({
        title: p.title || "Senza titolo",
        description: p.description || "",
        start: start.toISO(),
        end: end.toISO(),
        poster: p.imageUrl || null
      });
    }

    return programs;
  } catch (err) {
    console.error(`❌ Tivù ${channelId} ${dateStr}: ${err.message}`);
    return [];
  }
}

/**
 * Main entry for multiple Tivù channels.
 * @param {number[]} channels
 * @returns {Object[]} Array of {id, name, programs}
 */
export default async function fetchTivuEPG(channels) {
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
      name: `Tivu ${id}`,
      programs: all
    });

    console.log(`✅ Tivù ${id}: ${all.length} programs`);
  }

  return results;
}
