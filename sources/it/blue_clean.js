// ====================================================================
//  blue_clean.js — Optimized Blue.ch EPG (Zappr-style + Luxon parallel)
//  Author: KritereTV (improved multi-node + safe parallel fetching)
// ====================================================================
import { DateTime } from "luxon";

const BLUE_BASE = "https://services.sg101.prd.sctv.ch";

function toRome(isoString) {
  try {
    return DateTime.fromISO(isoString, { zone: "Europe/Rome" });
  } catch {
    return null;
  }
}

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

  // ✅ Merge across all nodes, not just index 0
  const items =
    json?.Nodes?.Items?.flatMap(node => node?.Content?.Nodes?.Items || []) || [];

  const programs = [];

  for (const entry of items) {
    // ✅ Accept either Availabilities or Schedules
    const avail = entry?.Availabilities?.[0] || entry?.Schedules?.[0];
    if (!avail) continue;

    const startTime = toRome(avail.AvailabilityStart || avail.Start);
    const endTime = toRome(avail.AvailabilityEnd || avail.End);
    if (!startTime || !endTime) continue;

    const desc = entry?.Content?.Description || {};
    const nodes = entry?.Content?.Nodes?.Items || [];

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

export default async function fetchBlueEPG(channels) {
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

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY_LIMIT, channels.length) }, () =>
      worker()
    )
  );

  return results;
}
