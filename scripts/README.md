# Scripts (`scripts/`)

**Status:** Active.

| Script | Purpose |
|---|---|
| `apps/api/scripts/seed_demo.py` | Idempotent `demo-eng` tenant with realistic risk data and demo logins |

Run from `apps/api/`:

```bash
python -m scripts.seed_demo
```

Sample CSVs for manual ingestion testing live in `apps/api/scripts/sample_data/`.
