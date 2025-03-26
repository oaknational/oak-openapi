#!/bin/sh

WATCH_FILE="videos.tsv"
TMP_DIR="/tmp/downloads"

mkdir -p "$TMP_DIR"

tail -n0 -F "$WATCH_FILE" | while IFS= read -r line; do
  [ -z "$line" ] && continue

  url=$(printf '%s' "$line" | cut -f1)
  filename=$(printf '%s' "$line" | cut -f2)
  tarball=$(printf '%s' "$line" | cut -f3)
  tmpfile="$TMP_DIR/$filename"

  echo "Downloading $filename from $url to $tmpfile and appending to $tarball"

  wget -q -O "$tmpfile" "$url" && \
    tar --append --file="$tarball" -C "$TMP_DIR" "$filename" && \
    rm "$tmpfile" && \
    sed -i.bak "\|$line|d" "$WATCH_FILE"
done