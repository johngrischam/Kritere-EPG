// ====================================================================
// blue_clean.js — Blue.ch EPG (Zappr-style DOM + Luxon time conversion)
// Author: KritereTV (clean implementation, DOM parsed with Linkedom)
// Output: [{ id, name, logo, programs[] }]
// ====================================================================

import { DateTime } from "luxon";
import { parseHTML } from "linkedom";
// If Node < 18, uncomment:
// import fetch from "node-fetch";

export default async function fetchBlueEPG(channels) {
  const epg = [];

  // 1️⃣ Fetch the official Blue.ch XML feed (same used by iptv-org)
  const BLUE_XML =
    "https://raw.githubusercontent.com/iptv-org/epg/refs/heads/master/sites/tv.blue.ch/tv.blue.ch.epg.xml";

  const res = await fetch(BLUE_XML, {
    headers: { "User-Agent": "kritere-epg/1.0" },
  });
  if (!res.ok) throw new Error(`Blue.ch XML fetch failed: ${res.status}`);
  const xml = await res.text();

  // 2️⃣ Parse XML via Linkedom (Zappr-style)
  const { document } = parseHTML(xml);

  // 3️⃣ Wildcard: if ["*"] expand to all channel ids present in <programme>
  if (channels && channels[0] === "*") {
    channels = [
      ...new Set(
        Array.from(document.querySelectorAll("programme"))
          .map((p) => p.getAttribute("channel"))
          .filter(Boolean)
      ),
    ];
  }

  // 4️⃣ Build EPG per channel id
  for (const id of channels) {
    const chNode = document.querySelector(`channel[id="${id}"]`);
    const name =
      chNode?.querySelector("display-name")?.textContent?.trim() ||
      `Blue ${id}`;
    const logo =
      chNode?.querySelector("icon")?.getAttribute("src")?.trim() || null;

    const programs = [];
    const progs = document.querySelectorAll(`programme[channel="${id}"]`);

    for (const p of progs) {
      const startRaw = p.getAttribute("start");
      const stopRaw = p.getAttribute("stop");

      // Blue.ch XML uses UTC timestamps: 20251105190000 +0000
      const startDT = DateTime.fromFormat(startRaw, "yyyyMMddHHmmss +0000").setZone("Europe/Rome");
      const endDT = DateTime.fromFormat(stopRaw, "yyyyMMddHHmmss +0000").setZone("Europe/Rome");

      const titleEl = p.querySelector("title");
      const descEl = p.querySelector("desc");
      const iconEl = p.querySelector("icon");

      const item = {
        title: (titleEl?.textContent || "").trim() || "Senza titolo",
        description: (descEl?.textContent || "").trim() || null,
        start: startDT.toISO(),
        end: endDT.toISO(),
        poster: iconEl?.getAttribute("src")?.trim() || logo || null,
      };

      programs.push(item);
    }

    epg.push({
      id,
      name,
      logo,
      programs,
    });

    console.log(`✅ Blue.ch ${id}: ${programs.length} programmi`);
  }

  return epg;
}

