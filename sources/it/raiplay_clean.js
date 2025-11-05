// ====================================================================
//  raiplay_clean.js — Clean-room EPG fetcher for RaiPlay
//  Author: KritereTV (independent, no GPL text)
//  --------------------------------------------------------------------
//  Downloads 8 days of program schedules from RaiPlay's public JSON API
//  and returns ISO timestamps in Europe/Rome time zone.
// ====================================================================

import { DateTime } from "luxon";

/**
 * Helper: build a daily EPG list for one RaiPlay channel.
 */
async function fetchDay(channelId, dayOffset) {
  const date = DateTime.now()
    .setZone("Europe/Rome")
    .plus({ days: dayOffset - 1 })
    .toFormat("dd-MM-yyyy");

  const url = `https://www.raiplay.it/palinsesto/app/${channelId}/${date}.json`;

  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`⚠️ RaiPlay ${channelId} day ${date}: ${res.status}`);
    return [];
  }

  const json = await res.json();
  const todayStart = DateTime.now().setZone("Europe/Rome").startOf("day");
  const programs = [];

  for (const entry of json.events || []) {
    const start = DateTime.fromFormat(
      `${entry.date} ${entry.hour}`,
      "dd/MM/yyyy HH:mm",
      { zone: "Europe/Rome" }
    ).minus({ hours: 1 }); // small timezone fix used by RaiPlay

    const duration = entry.duration?.trim()?.split(":") || ["00", "00", "00"];
    const end = start.plus({
      hours: +duration[0],
      minutes: +duration[1],
      seconds: +duration[2],
    });

    if (end < todayStart) continue; // skip old shows

    programs.push({
      title:
        entry.episode_title?.trim() ||
        entry.program?.name?.trim() ||
        entry.name?.trim() ||
        "Senza titolo",
      description: entry.description?.trim() || "",
      start: start.toISO(),
      end: end.toISO(),
      poster: entry.image
        ? `https://www.raiplay.it${entry.image.trim()}`
        : null,
    });
  }

  return programs;
}

/**
 * Main entry for multiple RaiPlay channels.
 * @param {string[]} channels
 * @returns {Object[]} Array of {id, name, programs}
 */
export default async function fetchRaiPlayEPG(channels) {
  const results = [];
  for (const ch of channels) {
    const programs = [];
    for (let i = 0; i < 8; i++) {
      const dayList = await fetchDay(ch, i);
      programs.push(...dayList);
    }
    results.push({ id: ch, name: ch.replace(/-/g, " "), programs });
    console.log(`✅ RaiPlay ${ch}: ${programs.length} programs`);
  }
  return results;
}
