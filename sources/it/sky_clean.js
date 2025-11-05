// ====================================================================
//  sky_clean.js — Fetch EPG from Sky Italia public API
//  Clean-room implementation by KritereTV
// ====================================================================

import { DateTime } from "luxon";

const BASE_URL = "https://guidatv-api.sky.it/app/epg/events";

/**
 * Fetch one day's schedule for a Sky Italia channel.
 * @param {number|string} channelId
 * @param {DateTime} dateRome
 */
async function fetchDay(channelId, dateRome) {
  const fromISO = dateRome.startOf("day").toISO();
  const toISO = dateRome.plus({ days: 1 }).startOf("day").toISO();
  const url = `${BASE_URL}?ch=${channelId}&from=${encodeURIComponent(fromISO)}&to=${encodeURIComponent(toISO)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`⚠️ Sky ${channelId} ${dateRome.toISODate()}: ${res.status}`);
      return [];
    }

    const json = await res.json();
    const events = json?.events || [];
    const programs = [];

    for (const ev of events) {
      const start = DateTime.fromISO(ev.starttime, { zone: "Europe/Rome" });
      const end = DateTime.fromISO(ev.endtime, { zone: "Europe/Rome" });
      if (!start.isValid || !end.isValid) continue;

      programs.push({
        title: ev.title || "Senza titolo",
        description: ev.synopsis || "",
        start: start.toISO(),
        end: end.toISO(),
        poster: ev.poster || null
      });
    }

    return programs;
  } catch (err) {
    console.error(`❌ Sky ${channelId} ${dateRome.toISODate()}: ${err.message}`);
    return [];
  }
}

/**
 * Main entry for multiple Sky channels.
 * @param {(number|string)[]} channels
 * @returns {Promise<Object[]>}
 */
export default async function fetchSkyEPG(channels) {
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
      name: `Sky ${id}`,
      programs: all
    });

    console.log(`✅ Sky ${id}: ${all.length} programs`);
  }

  return results;
}
