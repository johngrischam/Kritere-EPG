// ====================================================================
// samsungtvplus_clean.js — Samsung TV Plus (Italy) via i.mjh.nz XML
// Zappr-style: Luxon + Linkedom, no external logger
// ====================================================================

import { DateTime } from "luxon";
import { parseHTML } from "linkedom";
// If you're on Node < 18, uncomment:
// import fetch from "node-fetch";

export default async function fetchEPG(channels) {
  const epg = {};

  // 1) Fetch the single XMLTV file (same source Zappr relies on)
  const res = await fetch("https://i.mjh.nz/SamsungTVPlus/it.xml", {
    headers: { "User-Agent": "kritere-epg/1.0" }
  });
  if (!res.ok) throw new Error(`SamsungTVPlus XML fetch failed: ${res.status}`);
  const xml = await res.text();

  // 2) Parse XML with Linkedom (Zappr-style DOM querying)
  const { document } = parseHTML(xml);

  // 3) Wildcard: expand "*" to every channel id present in <programme>
  if (channels && channels[0] === "*") {
    channels = [...new Set(
      Array.from(document.querySelectorAll("programme"))
        .map(el => el.getAttribute("channel"))
        .filter(Boolean)
    )];
  }

  // 4) Build EPG per requested channel
  for (const id of channels) {
    const list = [];
    const nodes = document.querySelectorAll(`programme[channel="${id}"]`);

    for (const entry of nodes) {
      const startRaw = entry.getAttribute("start"); // e.g. 20251105060000 +0000
      const stopRaw  = entry.getAttribute("stop");

      // XML feed uses "+0000". Parse as literal and convert to Europe/Rome.
      // (Matches your Zappr-style code path.)
      const startDT = DateTime.fromFormat(startRaw, "yyyyMMddHHmmss +0000").setZone("Europe/Rome");
      const endDT   = DateTime.fromFormat(stopRaw,  "yyyyMMddHHmmss +0000").setZone("Europe/Rome");

      const titleEl = entry.querySelector("title");
      const subEl   = entry.querySelector("sub-title");
      const descEl  = entry.querySelector("desc");
      const iconEl  = entry.querySelector("icon");

      const item = {
        name: (titleEl?.textContent || "").trim(),
        startTime: { unix: startDT.ts, iso: startDT.toISO() },
        endTime:   { unix: endDT.ts,   iso: endDT.toISO() }
      };
      if (subEl?.textContent?.trim())  item.subtitle    = subEl.textContent.trim();
      if (descEl?.textContent?.trim()) item.description = descEl.textContent.trim();
      const iconSrc = iconEl?.getAttribute("src");
      if (iconSrc && iconSrc.trim())   item.image       = iconSrc.trim();

      list.push(item);
    }

    epg[id] = list;
  }

  return epg;
}
