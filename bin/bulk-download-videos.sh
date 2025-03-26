#!/bin/sh

WATCH_FILE="videos.tsv"
TMP_DIR="/tmp/downloads"

mkdir -p "$TMP_DIR"

while true; do
  if [ -f "$WATCH_FILE" ]; then
    line=$(head -n 1 "$WATCH_FILE")
  else
    sleep 1
    continue
  fi

  [ -z "$line" ] && sleep 1 && continue

  echo "$line"

  url=$(printf '%s' "$line" | cut -f1)
  filename=$(printf '%s' "$line" | cut -f2)
  dir=$(printf '%s' "$line" | cut -f3)
  outdir="out/$dir/videos"
  mkdir -p "$outdir"
  tmpfile="$outdir/$filename"


  wget -q "$url" -O "$tmpfile" && \
    sed -i.bak "\|$line|d" "$WATCH_FILE"
done