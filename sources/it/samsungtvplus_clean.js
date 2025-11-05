// ====================================================================
// samsungtvplus_clean.js — Fetch EPG for Samsung TV Plus (Italy)
// Clean-room version by KritereTV (no logger)
// ====================================================================

import { DateTime } from "luxon";
// If you’re on Node < 18, uncomment next line:
// import fetch from "node-fetch";

/**
 * Expand channels:
 * - ["*"] => fetches the full Italy channel list (it.channels.json)
 * - Otherwise returns the array as-is (but string-normalized)
 */
async function expandChannels(channels) {
  if (!channels || !channels.length) return [];
  if (channels[0] !== "*") {
    return channels.map(c => String(c).trim()).filter(Boolean);
  }
  try {
    const listURL = "https://i.mjh.nz/SamsungTVPlus/it.channels.json";
    const resp = await fetch(listURL);
    if (!resp.ok) {
      console.warn(`[SamsungTVPlus] Channel list fetch failed: ${resp.status}`);
      return [];
    }
    const list = await resp.json();
    // list items look like: { id, name, ... }
    const ids = Array.from(new Set(list.map(ch => ch.id).filter(Boolean)));
    if (!ids.length) {
      console.warn("[SamsungTVPlus] Channel list empty.");
    }
    return ids;
  } catch (e) {
    console.error("[SamsungTVPlus] Channel list error:", e?.message || e);
    return [];
  }
}

export default async function fetchEPG(channels) {
  const epg = {};
  const tz = "Europe/Rome";
  const now = DateTime.now().setZone(tz);

  // 1) Resolve channels (supports "*")
  const resolved = await expandChannels(channels);
  if (!resolved.length) return epg;

  // 2) Prepare tasks (parallel fetch per channel)
  const tasks = resolved.map(async (channelId) => {
    epg[channelId] = [];
    const url = `https://i.mjh.nz/SamsungTVPlus/it/${encodeURIComponent(channelId)}.epg.json`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        // 404 just means that channel has no JSON EPG file
        if (res.status !== 404) {
          console.warn(`[SamsungTVPlus] ${channelId} -> ${res.status}`);
        }
        return;
      }

      const programs = await res.json();
      if (!Array.isArray(programs) || !programs.length) {
        // No programs for this channel
        return;
      }

      // IMPORTANT: Don’t over-filter — just normalize & push.
      // (Your previous “end > today” filter could drop everything.)
      for (const p of programs) {
        // Defensive checks
        if (!p.start || !p.stop) continue;

        const start = DateTime.fromISO(p.start, { zone: tz });
        const end = DateTime.fromISO(p.stop, { zone: tz });

        epg[channelId].push({
          title: (p.title || "").trim() || null,
          description: (p.desc || "").trim() || null,
          start: start.isValid ? start.toISO() : p.start,
          end: end.isValid ? end.toISO() : p.stop,
          poster: (p.icon || "").trim() || null
        });
      }
    } catch (err) {
      console.error(`[SamsungTVPlus] Error fetching ${channelId}:`, err?.message || err);
    }
  });

  // 3) Run all fetches
  await Promise.allSettled(tasks);

  return epg;
}
