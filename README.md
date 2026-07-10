# Zvenegram Dictionary

Import-, curation- and reporting pipeline for Swedish words used by Zvenegram. Raw source data is kept separate from reviewed output.

## Run

```bash
npm run download
npm run curate
npm run check
```

The pipeline normalizes words to lowercase NFC, requires at least four letters, accepts only `a-zåäö`, removes duplicates and respects manual include/exclude files. Suspicious pattern matches are sent to `data/reports/review.txt` rather than silently removed.

## Curation policy

- `config/exclude.txt` contains explicitly rejected words.
- `config/include.txt` contains reviewed words that may bypass review patterns.
- `config/review-patterns.txt` contains patterns that require human review.
- Every rejection is recorded with a reason in `data/reports/rejected.tsv`.
- Source files are immutable inputs; curation never edits them.

The next phase will add linguistic quality flags, inflection handling, offensive-term review, frequency signals and puzzle-generation suitability scores.
