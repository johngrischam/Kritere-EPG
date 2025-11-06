// ====================================================================
//  superguidatv_clean.js — SuperGuidaTV EPG (Zappr-style + Luxon)
//  Author: KritereTV (classic logic: 1-day, channelId[], ct-ver=1is)
//  Output: { [channelId]: [programs[]] }
// ====================================================================

import { DateTime } from "luxon";
import log from "../../utils/logger";

// --- Helper: random generator (Zappr-style) ---
function randomString(length, hex = false) {
  const chars = hex
    ? "abcdef1234567890"
    : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// --- Fetch temporary guest token (valid ~15 min) ---
async function getGuestToken() {
  const token = `${Math.floor(DateTime.now().toSeconds())}-${randomString(43)}=`;
  const res = await fetch("https://api-ng.superguidatv.it/v3/oauth/guest", {
    method: "POST",
    headers: {
      "x-client-token": token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: randomString(22),
      device_id: `AID_${randomString(16, true)}`
    })
  });

  const json = await res.json();
  return json.access_token;
}

// --- Main: fetch one day sequentially for each channelId ---
export default async function fetchEPG(channels) {
  const accessToken = await getGuestToken();
  let epg = {};

  for (const channel in channels) {
    const ch = channels[channel];
    epg[ch] = [];
    let lastEntryEndDate;

    // ✅ 1-day only
    const startDate = DateTime.now().setZone("Europe/Rome").toFormat("yyyy-MM-dd");
    const endDate = DateTime.now().setZone("Europe/Rome").plus({ days: 1 }).toFormat("yyyy-MM-dd");

    log("generating", { source: "superguidatv", channel: ch, day: `${startDate} - ${endDate}` });

    try {
      const res = await fetch(
        `https://api-ng.superguidatv.it/v3/channels-events?startDate=${startDate}T00:00:00&endDate=${endDate}T23:59:59&orderBy=channelNumber&channelId[]=${ch}&ct-ver=1is&bld=5504148&plt=ANDROID`,
        {
          headers: {
            "x-client-token": `${Math.floor(DateTime.now().toSeconds())}-${randomString(43)}=`,
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      const json = await res.json();
      if (!json?.[0]?.events) continue;

      epg[ch] = [
        ...epg[ch],
        ...json[0].events.flatMap((entry, index) => {
          const e = entry.event;
          const startTime = DateTime.fromISO(e.startDate);
          const endTime = DateTime.fromISO(e.endDate);
          if (!startTime.isValid || !endTime.isValid) return [];

          if ((lastEntryEndDate && startTime.ts > lastEntryEndDate) || lastEntryEndDate !== endTime.ts) {
            const today = DateTime.now().setZone("Europe/Rome").startOf("day");
            if (today.ts > endTime.ts) return [];

            let name =
              e.title === e.title.toLowerCase()
                ? e.title
                    .split(" ")
                    .map(el => el.charAt(0).toUpperCase() + el.slice(1))
                    .join(" ")
                : e.title;

            let result = {
              name,
              startTime: {
                unix: startTime.ts,
                iso: startTime.toISO()
              },
              endTime: {
                unix: endTime.ts,
                iso: endTime.toISO()
              }
            };

            // description
            if (e.story && e.story.trim()) {
              const story = e.story.trim();
              result.description =
                story[0] === story[0].toLowerCase()
                  ? story[0].toUpperCase() + story.slice(1)
                  : story;
            }

            // ✅ limited image fields
            if (entry.serie) {
              if (entry.serie.backdropUrl || entry.serie.coverUrl) {
                result.image = entry.serie.backdropUrl || entry.serie.coverUrl;
              }
            } else if (entry.program) {
              if (entry.program.backdropUrl || entry.program.coverUrl) {
                result.image = entry.program.backdropUrl || entry.program.coverUrl;
              }
            }

            // Fill "Programmazione non disponibile"
            if (lastEntryEndDate && index !== 0 && startTime.ts !== lastEntryEndDate) {
              result = [
                {
                  name: "Programmazione non disponibile",
                  startTime: {
                    unix: DateTime.fromMillis(lastEntryEndDate).ts,
                    iso: DateTime.fromMillis(lastEntryEndDate).toISO()
                  },
                  endTime: {
                    unix: startTime.ts,
                    iso: startTime.toISO()
                  }
                },
                result
              ];
            }

            lastEntryEndDate = endTime.ts;
            return result;
          } else return [];
        })
      ];

      // ✅ duplicate filtering
      const seenStarts = new Set();
      const seenEnds = new Set();
      epg[ch] = epg[ch].filter(ev => {
        const start = ev.startTime?.unix;
        const end = ev.endTime?.unix;
        if (!start || !end) return false;
        if (seenStarts.has(start) || seenEnds.has(end)) return false;
        seenStarts.add(start);
        seenEnds.add(end);
        return true;
      });

      log("generating-done", { source: "superguidatv", channel: ch, day: `${startDate} - ${endDate}` });
    } catch (err) {
      log("generating-fail", { source: "superguidatv", channel: ch, error: err.message });
    }

    log("spacer", { width: 89 });
  }

  return epg;
}
