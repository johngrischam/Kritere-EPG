// ====================================================================
//  blue_clean.js  —  Clean-room EPG fetcher for Blue.ch
//  Author: KritereTV (clean implementation, no GPL code)
//  --------------------------------------------------------------------
//  Fetches program data for multiple channels from the public
//  Blue.ch JSON service and returns times in Europe/Rome local time.
// ====================================================================

import { DateTime } from "luxon";

const BLUE_BASE = "https://services.sg101.prd.sctv.ch";

/**
 * Helper: safely parse to Luxon DateTime in Europe/Rome.
 */
function toRome(isoString) {
  try {
    return DateTime.fromISO(isoString, { zone: "Europe/Rome" });
  } catch {
    return null;
  }
}

/**
 * Returns an array of programs for a single Blue.ch channel.
 */
async function fetchChannel(site_id) {
  const today = DateTime.now().setZone("Europe/Rome");
  const start = today.minus({ days: 1 }).toFormat("yyyyMMdd0000");
  const end = today.plus({ days: 7 }).toFormat("yyyyMMdd0000");

  const url = `${BLUE_BASE}/catalog/tv/channels/list/(ids=${site_id};start=${start};end=${end};level=normal)`;

  const res = await fetch(url);
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

    // Pick the best poster image
    const preferred = ["Lane", "Stage", "Landscape"];
    let poster = null;
    for (const role of preferred) {
      const found = nodes.find(
        (n) => n?.Role === role && n?.ContentPath
      );
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

  return programs;
}

/**
 * Main entry: fetch EPG for multiple Blue.ch channels.
 * @param {Array<number>} channels
 * @returns {Object[]} Array of {id, name, programs}
 */
export default async function fetchBlueEPG(channels) {
  const results = [];
  for (const id of channels) {
    try {
      const programs = await fetchChannel(id);
      results.push({
        id: String(id),
        name: `Blue ${id}`,
        programs,
      });
      console.log(`✅ Blue ${id}: ${programs.length} programs`);
    } catch (e) {
      console.warn(`❌ Blue ${id}: ${e.message}`);
    }
  }
  return results;
}

