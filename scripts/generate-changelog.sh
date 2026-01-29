#!/usr/bin/env bash
set -euo pipefail

OUT_FILE=CHANGELOG-DETAILED.md
COMMITS=(
  31d5d20
  e60812f
  04b5a81
  4aa417a
  82108f1
  a5329e5
  9642580
  4d6e7f1
  ba8e3d5
  49ff0ea
  6c8bd2f
  f1df15b
)

echo "# CHANGELOG DETALHADO" > "$OUT_FILE"
echo "" >> "$OUT_FILE"
echo "Gerado em: $(date --iso-8601=seconds)" >> "$OUT_FILE"
echo "" >> "$OUT_FILE"

for c in "${COMMITS[@]}"; do
  echo "## Commit: $c" >> "$OUT_FILE"
  git show --pretty=format:"commit: %h - %s%nAuthor: %an%nDate: %ad%n%n%b" --date=short "$c" >> "$OUT_FILE"
  echo "" >> "$OUT_FILE"
  echo '---' >> "$OUT_FILE"
  echo "" >> "$OUT_FILE"
done

echo "Changelog written to $OUT_FILE"
