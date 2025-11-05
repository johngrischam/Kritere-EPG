// ====================================================================
// samsungtvplus_clean.js — Samsung TV Plus (Italy) via i.mjh.nz XML
// Zappr-style but outputs [{ id, name, logo, programs }] for merge_all
// ====================================================================

import { DateTime } from "luxon";
import { parseHTML } from "linkedom";
// If Node < 18, uncomment the next line:
// import fetch from "node-fetch";

export default async function fetchEPG(channels) {
  const epg = {};

  // 1️⃣ Fetch single XML feed (Zappr source)
  const res = await fetch("https://i.mjh.nz/SamsungTVPlus/it.xml", {
    headers: { "User-Agent": "kritere-epg/1.0" },
  });
  if (!res.ok) throw new Error(`SamsungTVPlus XML fetch failed: ${res.status}`);
  const xml = await res.text();

  // 2️⃣ Parse XML
  const { document } = parseHTML(xml);

  // 3️⃣ Wildcard expansion
  if (channels && channels[0] === "*") {
    channels = [...new Set(
      Array.from(document.querySelectorAll("programme"))
        .map(el => el.getAttribute("channel"))
        .filter(Boolean)
    )];
  }

  // 4️⃣ Build per-channel program list
  for (const id of channels) {
    const programs = [];
    const nodes = document.querySelectorAll(`programme[channel="${id}"]`);

    for (const entry of nodes) {
      const startRaw = entry.getAttribute("start");
      const stopRaw  = entry.getAttribute("stop");

      const startDT = DateTime.fromFormat(startRaw, "yyyyMMddHHmmss +0000").setZone("Europe/Rome");
      const endDT   = DateTime.fromFormat(stopRaw,  "yyyyMMddHHmmss +0000").setZone("Europe/Rome");

      const titleEl = entry.querySelector("title");
      const subEl   = entry.querySelector("sub-title");
      const descEl  = entry.querySelector("desc");
      const iconEl  = entry.querySelector("icon");

      const item = {
        title: (titleEl?.textContent || "").trim(),
        description: (descEl?.textContent || "").trim() || null,
        start: startDT.toISO(),
        end: endDT.toISO(),
        poster: (iconEl?.getAttribute("src") || "").trim() || null,
      };
      if (subEl?.textContent?.trim()) item.subtitle = subEl.textContent.trim();

      programs.push(item);
    }

    epg[id] = programs;
  }

  // 5️⃣ Convert EPG object → array [{ id, name, logo, programs }]
  const result = [];

  for (const id of Object.keys(epg)) {
    const chNode = document.querySelector(`channel[id="${id}"]`);
    const name =
      chNode?.querySelector("display-name")?.textContent?.trim() || id;
    const logo =
      chNode?.querySelector("icon")?.getAttribute("src")?.trim() || null;

    result.push({
      id,
      name,
      logo,
      programs: epg[id],
    });
  }

  return result;
}

