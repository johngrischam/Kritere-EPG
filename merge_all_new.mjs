// ====================================================================
//  merge_all_new.mjs  —  Unified EPG builder (Phase 2: Multi-Group Support)
//  Author: KritereTV (optimized for grouped Blue.ch sources)
// ====================================================================

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sources from "./lists/it/national_clean.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.join(__dirname, "merged_all.json");

async function main() {
  const allChannels = [];

  console.log("🚀 Starting full EPG merge process...\n");

  // Run all sources sequentially (but handle grouped sources automatically)
  for (const [name, src] of Object.entries(sources)) {
    try {
      // Accept any group that starts with blue, samsungtvplus, or superguidatv
      if (
        name.startsWith("blue") ||
        name.startsWith("samsungtvplus") ||
        name.startsWith("superguidatv")
      ) {
        console.log(`\n=== Fetching ${name} (${src.channels.length} channels) ===`);
        const data = await src.fetch(src.channels);
        if (Array.isArray(data)) {
          allChannels.push(...data);
          console.log(`✅ ${name} completed with ${data.length} entries.`);
        } else {
          console.warn(`⚠️ ${name} returned unexpected data type.`);
        }
      } else {
        console.log(`⏭️ Skipping unrecognized source: ${name}`);
      }
    } catch (err) {
      console.error(`❌ ${name} failed: ${err.message}`);
    }
  }

  // Write unified merged EPG file
  await fs.writeFile(OUT_FILE, JSON.stringify(allChannels, null, 2), "utf8");
  console.log(`\n💾 Saved → ${OUT_FILE}`);
  console.log(`📊 Total channels merged: ${allChannels.length}`);
}

main().catch((e) => {
  console.error("💥 Fatal error:", e);
  process.exit(1);
});
