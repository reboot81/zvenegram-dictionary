# Zvenegram Dictionary

Import-, curation- and reporting pipeline for Swedish words used by Zvenegram. Raw source data is kept separate from reviewed output.

## Run

```bash
npm run download
npm run curate
npm run check
npm test
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
