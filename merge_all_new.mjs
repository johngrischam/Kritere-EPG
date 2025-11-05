// ====================================================================
//  merge_all_new.mjs  —  Unified EPG builder (Phase 1: Blue + RaiPlay)
//  Author: KritereTV (clean implementation)
// ====================================================================

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sources from "./lists/it/national_clean.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.join(__dirname, "merged_all.json");

async function main() {
  const allChannels = [];

  for (const [name, src] of Object.entries(sources)) {
    console.log(`\n=== Fetching ${name} (${src.channels.length} channels) ===`);
    try {
      const data = await src.fetch(src.channels);
      allChannels.push(...data);
      console.log(`✅ ${name} done.`);
    } catch (err) {
      console.error(`❌ ${name} failed: ${err.message}`);
    }
  }

  // Write unified file
  await fs.writeFile(OUT_FILE, JSON.stringify(allChannels, null, 2), "utf8");
  console.log(`\n💾 Saved → ${OUT_FILE}`);
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
