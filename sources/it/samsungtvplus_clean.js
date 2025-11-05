// ====================================================================
// samsungtvplus_clean.js — Fetch EPG for Samsung TV Plus (Italy)
// Same logic as merge_all.mjs Samsung section (Matthuisman XML source)
// ====================================================================

import { XMLParser } from "fast-xml-parser";
// If Node < 18, uncomment the next line:
// import fetch from "node-fetch";

const SAMSUNG_URL =
  "https://raw.githubusercontent.com/matthuisman/i.mjh.nz/refs/heads/master/SamsungTVPlus/it.xml";

// Convert XMLTV time (e.g. "20251105060000 +0000") → ISO UTC
function parseXmltvTimeToIso(str) {
  if (!str) return null;
  const match = str.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s?([+\-]\d{4})?$/);
  if (!match) return null;

  const [_, y, m, d, H, M, S] = match;
  const timestampUTC = Date.UTC(
    parseInt(y),
    parseInt(m) - 1, // month 0-indexed
    parseInt(d),
    parseInt(H),
    parseInt(M),
    parseInt(S)
  );
  return new Date(timestampUTC).toISOString();
}

export default async function fetchEPG(channels) {
  const epg = {};

  // 1️⃣ Fetch XML from GitHub
  const res = await fetch(SAMSUNG_URL, {
    headers: { "User-Agent": "kritere-backend/1.0" },
  });
  if (!res.ok) throw new Error(`SamsungTVPlus XML fetch failed: ${res.status}`);
  const xmlText = await res.text();

  // 2️⃣ Parse XML
  const parser = new XMLParser({ ignoreAttributes: false });
  const xml = parser.parse(xmlText);

  const allChannels = xml.tv?.channel || [];
  const allPrograms = xml.tv?.programme || [];

  // 3️⃣ Expand wildcard “*” to all channel IDs
  if (channels[0] === "*") {
    channels = allChannels.map((ch) => ch["@_id"]).filter(Boolean);
  }

  // 4️⃣ Build EPG object per channel
  for (const id of channels) {
    epg[id] = [];

    const ch = allChannels.find((c) => c["@_id"] === id);
    const logo = ch?.icon?.["@_src"] || null;

    const progs = allPrograms
      .filter((p) => p["@_channel"] === id)
      .map((p) => ({
        title: p.title?.["#text"] || p.title || "",
        description: p.desc?.["#text"] || p.desc || "",
        start: parseXmltvTimeToIso(p["@_start"]),
        end: parseXmltvTimeToIso(p["@_stop"]),
        poster: p.icon?.["@_src"] || logo,
      }))
      .filter((p) => p.start && p.end);

    epg[id] = progs;
  }

  return epg;
}

