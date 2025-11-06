// ====================================================================
//  superguidatv_clean.js — SuperGuidaTV EPG (Zappr-style + Luxon)
//  Author: KritereTV (final hybrid build: guid[] primary, channelId[] fallback)
//  Output: [{ id, name, programs[] }]
// ====================================================================

import { DateTime } from "luxon";

// --- Internal helper: random generator (matches Zappr's style) ---
function randomString(length, hex = false) {
  const chars = hex
    ? "abcdef1234567890"
    : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// --- Fetch temporary guest token (valid ~15 min) ---
async function getGuestToken() {
  const token = `${Math.floor(Date.now() / 1000)}-${randomString(43)}=`;
  const body = {
    client_id: randomString(22),
    device_id: `AID_${randomString(16, true)}`
  };

  const res = await fetch("https://api-ng.superguidatv.it/v3/oauth/guest", {
    method: "POST",
    headers: {
      "x-client-token": token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error(`Guest token fetch failed (${res.status})`);
  const json = await res.json();
  console.log("✅ Access token received.");
  return { access: json.access_token, token };
}

// --- Poster resolver (detects all known fields, returns null if none) ---
function resolvePoster(entry) {
  const candidates = [
    entry?.event?.backdropUrl,
    entry?.event?.coverUrl,
    entry?.event?.images?.[0]?.url,
    entry?.serie?.backdropUrl,
    entry?.serie?.coverUrl,
    entry?.program?.backdropUrl,
    entry?.program?.coverUrl
  ];
  const url = candidates.find(u => typeof u === "string" && u.length > 10);
  if (!url) return null;
  return url.startsWith("/") ? "https://cdn.superguidatv.it" + url : url;
}

// --- Try fetching with guid[] first, fallback to channelId[] if needed ---
async function fetchDay(channelGuid, dateRome, auth) {
  const startDate = dateRome.toFormat("yyyy-MM-dd");
  const endDate = dateRome.plus({ days: 1 }).toFormat("yyyy-MM-dd");

  async function tryFetch(paramType) {
    const url =
      `https://api-ng.superguidatv.it/v3/channels-events?` +
      `startDate=${startDate}T00:00:00&endDate=${endDate}T23:59:59` +
      `&orderBy=channelNumber&${paramType}[]=${channelGuid}&ct-ver=1is&bld=5504148&plt=ANDROID`;

    const res = await fetch(url, {
      headers: {
        "x-client-token": auth.token,
        Authorization: `Bearer ${auth.access}`
      }
    });

    if (!res.ok) return { status: res.status, data: null };

    const json = await res.json();
    if (!json?.[0]?.events?.length) return { status: res.status, data: null };
    return { status: res.status, data: json };
  }

  // --- Primary: guid[] ---
  let result = await tryFetch("guid");

  // --- Fallback: channelId[] ---
  if (!result.data && (result.status === 401 || result.status === 404 || result.status === 500)) {
    console.warn(`⚠️ Fallback to channelId[] for ${channelGuid}`);
    result = await tryFetch("channelId");
  }

  const json = result.data;
  if (!json?.[0]?.events) return [];

  const programs = [];
  for (const entry of json[0].events) {
    const e = entry.event;
    if (!e?.startDate || !e?.endDate) continue;

    const start = DateTime.fromISO(e.startDate, { zone: "Europe/Rome" });
    const end = DateTime.fromISO(e.endDate, { zone: "Europe/Rome" });
    if (!start.isValid || !end.isValid) continue;

    programs.push({
      title: e.title || "Senza titolo",
      description: e.story || null,
      start: start.toISO(),
      end: end.toISO(),
      poster: resolvePoster(entry)
    });
  }

  return programs;
}

// --- Main entry: fetch multiple channels concurrently (limit=3) ---
export default async function fetchSuperGuidaEPG(channels) {
  const results = [];
  const today = DateTime.now().setZone("Europe/Rome").startOf("day");
  const auth = await getGuestToken();

  const CONCURRENCY = 3;
  const queue = [...channels];

  async function worker() {
    while (queue.length) {
      const id = queue.shift();
      const all = [];

      for (let i = 0; i < 7; i++) {
        const date = today.plus({ days: i });
        const dayPrograms = await fetchDay(id, date, auth);
        all.push(...dayPrograms);
      }

      results.push({
        id: String(id),
        name: `SuperGuidaTV ${id}`,
        programs: all
      });

      console.log(`✅ SuperGuidaTV ${id}: ${all.length} programs`);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, channels.length) }, () => worker())
  );

  return results;
}
