// ====================================================================
// blue_clean.js — Blue.ch EPG (official JSON API + Luxon conversion)
// Author: KritereTV (clean implementation, Zappr-style backend)
// Output: [{ id, name, logo, programs[] }]
// ====================================================================

import { DateTime } from "luxon";
// If Node < 18, uncomment:
// import fetch from "node-fetch";

const BLUE_BASE = "https://services.sg101.prd.sctv.ch";

/**
 * Convert ISO / UTC string → Europe/Rome DateTime safely
 */
function toRome(isoString) {
  try {
    return DateTime.fromISO(isoString, { zone: "Europe/Rome" });
  } catch {
    return null;
  }
}

/**
 * Fetch program list for a single Blue.ch channel ID
 */
async function fetchChannel(site_id) {
  const today = DateTime.now().setZone("Europe/Rome");
  const start = today.minus({ days: 1 }).toFormat("yyyyMMdd0000");
  const end = today.plus({ days: 7 }).toFormat("yyyyMMdd0000");

  const url = `${BLUE_BASE}/catalog/tv/channels/list/(ids=${site_id};start=${start};end=${end};level=normal)`;
  const res = await fetch(url, { headers: { "User-Agent": "kritere-epg/1.0" } });
  if (!res.ok) {
    console.warn(`⚠️ Blue.ch ${site_id}: HTTP ${res.status}`);
    return [];
  }

  const json = await res.json();
  const items =
    json?.Nodes?.Items?.[0]?.Content?.Nodes?.Items ||
    json?.Nodes?.Items?.[0]?.Nodes?.Items ||
    [];

  const programs = [];

  for (const entry of items) {
    const avail = Array.isArray(entry?.Availabilities)
      ? entry.Availabilities[0]
      : null;
    if (!avail) continue;

    const startTime = toRome(avail.AvailabilityStart);
    const endTime = toRome(avail.AvailabilityEnd);
    if (!startTime || !endTime) continue;

    const desc = entry?.Content?.Description || {};
    const nodes = entry?.Content?.Nodes?.Items || [];

    // Prefer image roles in this order
    const preferred = ["Lane", "Stage", "Landscape", "Title"];
    let poster = null;
    for (const role of preferred) {
      const found = nodes.find((n) => n?.Role === role && n?.ContentPath);
      if (found) {
        poster = `${BLUE_BASE}/content/images/${found.ContentPath.trim()}_w1920.webp`;
        break;
      }
    }

    programs.push({
      title: desc.Title || "Senza titolo",
      description: desc.Summary || desc.ShortSummary || "",
      start: startTime.toISO(),
      end: endTime.toISO(),
      poster,
    });
  }

  console.log(`✅ Blue.ch ${site_id}: ${programs.length} programmi`);
  return programs;
}

/**
 * Main entry point — fetch multiple Blue.ch channels
 * @param {Array<number>} channels  site_id list from tv.blue.ch.channels.xml
 * @returns {Array<{id,name,logo,programs}>}
 */
export default async function fetchBlueEPG(channels) {
  const results = [];

  for (const id of channels) {
    try {
      const programs = await fetchChannel(id);
      results.push({
        id: String(id),
        name: `Blue ${id}`,
        logo: null,
        programs,
      });
    } catch (err) {
      console.warn(`❌ Blue.ch ${id}: ${err.message}`);
    }
  }

  return results;
}

