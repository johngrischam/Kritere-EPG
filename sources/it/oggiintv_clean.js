// ====================================================================
//  oggiintv_clean.js — Fetch EPG from Oggi in TV public JSON API
//  Clean-room implementation by KritereTV
// ====================================================================

import { DateTime } from "luxon";

const BASE_URL = "https://www.oggiintv.net/api/programmi";

/**
 * Fetch one day's schedule for an Oggi in TV channel.
 * @param {string} channelSlug
 * @param {DateTime} dateRome
 */
async function fetchDay(channelSlug, dateRome) {
  const dateStr = dateRome.toFormat("yyyy-MM-dd");
  const url = `${BASE_URL}/${channelSlug}.json?date=${dateStr}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`⚠️ OggiInTV ${channelSlug} ${dateStr}: ${res.status}`);
      return [];
    }

    const json = await res.json();
    const programs = [];

    for (const p of json || []) {
      const start = DateTime.fromFormat(p.ora_inizio, "yyyy-MM-dd HH:mm:ss", {
        zone: "Europe/Rome",
      });
      const end = DateTime.fromFormat(p.ora_fine, "yyyy-MM-dd HH:mm:ss", {
        zone: "Europe/Rome",
      });
      if (!start.isValid || !end.isValid) continue;

      programs.push({
        title: p.titolo || "Senza titolo",
        description: p.descrizione || "",
        start: start.toISO(),
        end: end.toISO(),
        poster: p.locandina || null,
      });
    }

    return programs;
  } catch (err) {
    console.error(`❌ OggiInTV ${channelSlug} ${dateStr}: ${err.message}`);
    return [];
  }
}

/**
 * Main entry for multiple Oggi in TV channels.
 * @param {string[]} channels
 * @returns {Promise<Object[]>}
 */
export default async function fetchOggiInTVEPG(channels) {
  const results = [];
  const today = DateTime.now().setZone("Europe/Rome").startOf("day");

  for (const slug of channels) {
    const all = [];
    for (let i = 0; i < 7; i++) {
      const date = today.plus({ days: i });
      const daily = await fetchDay(slug, date);
      all.push(...daily);
    }

    results.push({
      id: slug,
      name: `OggiInTV ${slug}`,
      programs: all,
    });

    console.log(`✅ OggiInTV ${slug}: ${all.length} programs`);
  }

  return results;
}
