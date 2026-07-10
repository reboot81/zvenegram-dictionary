# Zvenegram Dictionary

Import-, curation- and reporting pipeline for Swedish words used by Zvenegram. Raw source data is kept separate from reviewed output.

## Run

```bash
npm run download
npm run curate
npm run check
npm test
npm run generate -- --count=10 --seed=zvenegram-v1
```

The pipeline normalizes words to lowercase NFC, requires 4–12 letters, accepts only `a-zåäö`, removes duplicates and respects manual include/exclude files. A Swedish subtitle frequency list supplies a familiarity signal. Suspicious or uncommon candidates are sent to `data/reports/review.tsv` rather than silently removed.

## Curation policy

- `config/exclude.txt` contains explicitly rejected words.
- `config/include.txt` contains reviewed words that may bypass review patterns.
- `config/review-patterns.txt` contains patterns that require human review.
- Every rejection is recorded with a reason in `data/reports/rejected.tsv`.
- Source files are immutable inputs; curation never edits them.
- `approved` contains structurally valid words present in the Swedish top-50,000 frequency source and above the quality threshold.
- `review` contains structurally valid but uncommon, missing-frequency or pattern-flagged words.
- `rejected` contains structural failures and manual exclusions.

`data/processed/scored-words.json` preserves score, length and frequency metadata for the future puzzle generator. The base word list is public domain. Frequency-enriched output also uses CC BY-SA 4.0 data and must retain the attribution and applicable share-alike terms documented in `SOURCES.md`.

## Puzzle generation

The generator builds a connected 4×4 board with exactly 16 used cells. Each word step uses an immediately adjacent horizontal, vertical or diagonal cell. It rejects repeated cells, nested solution words and invalid board paths. Output JSON is compatible with Zvenegram and may be copied into `zvenegram/src/data/generated-puzzles.json`.

The generator retries up to 5,000 candidate layouts per requested puzzle. This prevents a single unlucky random sequence from aborting a larger batch while keeping output deterministic for a chosen seed.
