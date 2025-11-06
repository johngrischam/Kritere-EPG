// ====================================================================
//  blue_clean.js — Optimized Blue.ch EPG (Zappr-style + Luxon parallel)
//  Author: KritereTV (clean implementation, safe parallel fetching)
// ====================================================================
import { DateTime } from "luxon";

const BLUE_BASE = "https://services.sg101.prd.sctv.ch";

// --- Helper: convert UTC ISO → Europe/Rome ---
function toRome(isoString) {
  try {
    return DateTime.fromISO(isoString, { zone: "Europe/Rome" });
  } catch {
    return null;
  }
}

// --- Fetch a single Blue.ch channel's EPG ---
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
  const items = json?.Nodes?.Items?.[0]?.Content?.Nodes?.Items || [];
  const programs = [];

  for (const entry of items) {
    const avail = entry?.Availabilities?.[0];
    if (!avail) continue;

    const startTime = toRome(avail.AvailabilityStart);
    const endTime = toRome(avail.AvailabilityEnd);
    if (!startTime || !endTime) continue;

    const desc = entry?.Content?.Description || {};
    const nodes = entry?.Content?.Nodes?.Items || [];

    // Prefer Lane > Stage > Landscape
    const preferred = ["Lane", "Stage", "Landscape"];
    let poster = null;
    for (const role of preferred) {
      const found = nodes.find((n) => n?.Role === role && n?.ContentPath);
      if (found) {
        poster = `${BLUE_BASE}/content/images/${found.ContentPath.trim()}_w1920.webp`;
        break;
      }
    }

    const rating =
      desc.AgeRestrictionRating && desc.AgeRestrictionRating !== "0+"
        ? { label: desc.AgeRestrictionRating }
        : null;

    programs.push({
      title: desc.Title || "Senza titolo",
      description: desc.Summary || desc.ShortSummary || "",
      start: startTime.toISO(),
      end: endTime.toISO(),
      poster,
      rating,
    });
  }

  console.log(`✅ Blue.ch ${site_id}: ${programs.length} programmi`);
  return programs;
}

// --- Main entry: fetch all channels in parallel (fast + safe) ---
export default async function fetchBlueEPG(channels) {
  // Limit concurrency to 5 channels at once to avoid overload
  const CONCURRENCY_LIMIT = 5;
  const results = [];
  const queue = [...channels];

  async function worker() {
    while (queue.length) {
      const id = queue.shift();
      try {
        const programs = await fetchChannel(id);
        results.push({ id: String(id), name: `Blue ${id}`, programs });
      } catch (e) {
        console.warn(`❌ Blue.ch ${id}: ${e.message}`);
      }
    }
  }

  // Launch workers (parallel batches)
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY_LIMIT, channels.length) }, () =>
      worker()
    )
  );

  return results;
}
