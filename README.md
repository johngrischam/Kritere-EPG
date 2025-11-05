# 🇮🇹 Kritere-EPG — Italian EPG Aggregator

**Kritere-EPG** is a clean-room, fully automated multi-source Electronic Program Guide generator for Italian TV.  
It fetches, merges, and normalizes EPG data every 6 hours from eight major open sources.

---

## 📡 Sources

| Source | Type | Coverage |
|:--|:--|:--|
| Blue.ch | XML | Swiss / Italian hybrid |
| RaiPlay | JSON | Official Rai channels |
| Samsung TV Plus | XML/JSON | FAST & Smart TV |
| Tivù | JSON | Tivùsat / DTT |
| SuperGuida TV | JSON | La7, TV8, 20 Mediaset |
| Sky Italia | JSON | Sky Uno, TG24, Cinema |
| Mediaset Infinity | JSON | Canale 5, Italia 1, Iris … |
| Oggi in TV | JSON | TV8, Real Time, Cielo … |

---

## 🕒 Automation

- **GitHub Action:** `.github/workflows/update_all.yml`  
- **Schedule:** every 6 hours  
- **Output:** `merged_all.json` (UTC-normalized, ISO timestamps, poster URLs)

---

## 🧩 JSON Format

Each channel entry looks like:

```json
{
  "id": "rai-1",
  "name": "Rai 1",
  "programs": [
    {
      "title": "TG1 Mattina",
      "description": "Notizie e approfondimenti",
      "start": "2025-11-06T06:00:00Z",
      "end": "2025-11-06T07:00:00Z",
      "poster": "https://..."
    }
  ]
}
