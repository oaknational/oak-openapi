#!/usr/bin/env bash
# Extract unique lessons (with subject, keystage, unit) from a CSV file.
# Outputs JSON via jq.
# Usage: ./bin/unique-lesson-slugs.sh <csv-file> [output-file]

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <csv-file> [output-file]" >&2
  exit 1
fi

INPUT="$1"
OUTPUT="${2:-tmp/unique-lesson-slugs.json}"

python3 -c "
import csv, json, sys
with open(sys.argv[1]) as f:
    reader = csv.DictReader(f)
    seen = set()
    rows = []
    for row in reader:
        key = row['lesson_slug']
        n_restricted = float(row.get('n_restricted', 0) or 0)
        if n_restricted > 0 and key not in seen:
            seen.add(key)
            rows.append(json.dumps({
                'subject_slug': row['subject_slug'],
                'keystage_slug': row['keystage_slug'],
                'unit_slug': row['unit_slug'],
                'lesson_slug': row['lesson_slug'],
            }))
    # Output newline-delimited JSON for jq
    print('\n'.join(rows))
" "$INPUT" | jq -s 'sort_by(.subject_slug, .keystage_slug, .unit_slug, .lesson_slug)' > "$OUTPUT"

echo "Wrote $(jq length "$OUTPUT") unique lessons to $OUTPUT"
