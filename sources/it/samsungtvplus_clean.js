// ====================================================================
// samsungtvplus_clean.js — Samsung TV Plus (Italy)
// Zappr-style: uses Linkedom DOM parsing + Luxon time conversion
// Output: [{ id, name, logo, programs[] }]
// ====================================================================

import { DateTime } from "luxon";
import { parseHTML } from "linkedom";
// If Node < 18, uncomment:
// import fetch from "node-fetch";

export default async function fetchEPG(channels) {
  const epg = [];

  // 1️⃣ Fetch the XML (Zappr source)
  const res = await fetch("https://i.mjh.nz/SamsungTVPlus/it.xml", {
    headers: { "User-Agent": "kritere-epg/1.0" },
  });
  if (!res.ok) throw new Error(`SamsungTVPlus XML fetch failed: ${res.status}`);
  const xml = await res.text();

  // 2️⃣ Parse as DOM
  const { document } = parseHTML(xml);

  // 3️⃣ Get all <channel> and <programme>
  const allChannels = Array.from(document.querySelectorAll("channel"));
  const allPrograms = Array.from(document.querySelectorAll("programme"));

  // 4️⃣ Wildcard support
  if (channels && channels[0] === "*") {
    channels = allChannels.map(c => c.getAttribute("id")).filter(Boolean);
  }

  // 5️⃣ For each channel id, collect metadata + programs
  for (const id of channels) {
    const chNode = allChannels.find(c => c.getAttribute("id") === id);
    const name = chNode?.querySelector("display-name")?.textContent?.trim() || id;
    const logo = chNode?.querySelector("icon")?.getAttribute("src")?.trim() || null;

    const programs = [];
    const progNodes = allPrograms.filter(p => p.getAttribute("channel") === id);

    for (const entry of progNodes) {
      const startRaw = entry.getAttribute("start");
      const stopRaw = entry.getAttribute("stop");

      const startDT = DateTime.fromFormat(startRaw, "yyyyMMddHHmmss +0000").setZone("Europe/Rome");
      const endDT   = DateTime.fromFormat(stopRaw,  "yyyyMMddHHmmss +0000").setZone("Europe/Rome");

      const titleEl = entry.querySelector("title");
      const subEl   = entry.querySelector("sub-title");
      const descEl  = entry.querySelector("desc");
      const iconEl  = entry.querySelector("icon");

      const item = {
        title: (titleEl?.textContent || "").trim(),
        start: startDT.toISO(),
        end: endDT.toISO(),
        description: (descEl?.textContent || "").trim() || null,
        poster: (iconEl?.getAttribute("src") || logo || "").trim() || null,
      };
      if (subEl?.textContent?.trim()) item.subtitle = subEl.textContent.trim();

      programs.push(item);
    }

    epg.push({ id, name, logo, programs });
  }

  return epg;
}

