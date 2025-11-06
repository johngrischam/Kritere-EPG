// ====================================================================
//  superguidatv_clean.js — SuperGuidaTV EPG (Zappr-style + Luxon)
//  Author: KritereTV (final hybrid build + enhanced poster + channel icon fallback)
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

// --- Poster resolver (checks multiple fields) ---
function resolvePoster(entry) {
  const candidates = [
    entry?.event?.backdropUrl,
    entry?.event?.coverUrl,
    entry?.event?.imageUrl,
    entry?.event?.images?.[0]?.url,
    entry?.program?.backdropUrl,
    entry?.program?.coverUrl,
    entry?.program?.imageUrl,
    entry?.program?.images?.[0]?.url,
    entry?.serie?.backdropUrl,
    entry?.serie?.coverUrl,
    entry?.serie?.imageUrl,
    entry?.serie?.images?.[0]?.url
  ];
  const url = candidates.find(u => typeof u === "string" && u.length > 10);
  if (!url) return null;
  return url.startsWith("/") ? "https://cdn.superguidatv.it" + url : url;
}

// --- Channel icon resolver (used as fallback) ---
function resolveChannelIcon(channelData) {
  const candidates = [
    channelData?.logo,
    channelData?.imageUrl,
    channelData?.images?.[0]?.url
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
      `&orderBy=channelNumber&${paramType}[]=${channelGuid}` +
      `&ct-ver=4.0.9&bld=5504148&plt=ANDROID&uid=AID1234567890&pkg=com.idea.superguidatv`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "SuperGuidaTV/4.0.9 (Android; SDK 33; Device Google Pixel)",
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

  const channelIcon = resolveChannelIcon(json[0]?.channel);
  const programs = [];

  for (const entry of json[0].events) {
    const e = entry.event;
    if (!e?.startDate || !e?.endDate) continue;

    const start = DateTime.fromISO(e.startDate, { zone: "Europe/Rome" });
    const end = DateTime.fromISO(e.endDate, { zone: "Europe/Rome" });
    if (!start.isValid || !end.isValid) continue;

    const poster = resolvePoster(entry) || channelIcon;

    programs.push({
      title: e.title || "Senza titolo",
      description: e.story || null,
      start: start.toISO(),
      end: end.toISO(),
      poster
    });
  }

  return programs;
}

// --- Main entry: fetch multiple channels concurrently (limit=3, 1 day only) ---
export default async function fetchSuperGuidaEPG(channels) {
  const results = [];
  const today = DateTime.now().setZone("Europe/Rome").startOf("day");
  const auth = await getGuestToken();

  const CONCURRENCY = 3;
  const queue = [...channels];

  async function worker() {
    while (queue.length) {
      const id = queue.shift();

      // Fetch only today's EPG
      const programs = await fetchDay(id, today, auth);

      results.push({
        id: String(id),
        name: `SuperGuidaTV ${id}`,
        programs
      });

      console.log(`✅ SuperGuidaTV ${id}: ${programs.length} programs`);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, channels.length) }, () => worker())
  );

  return results;
}

