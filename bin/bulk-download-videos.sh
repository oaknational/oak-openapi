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

  sed -i.bak "\|$line|d" "$WATCH_FILE"

  url=$(printf '%s' "$line" | cut -f1)
  filename=$(printf '%s' "$line" | cut -f2)
  dir=$(printf '%s' "$line" | cut -f3)

  if [ "$url" = "complete" ]; then
    # test if the "out/$dir/videos" directory exists
    if [ -d "out/$dir/videos" ]; then
      tarfile="out/$dir/${dir}-videos.tar"
      echo "Creating tarball: $tarfile"
      tar -cf "$tarfile" -C "$outdir/.." "videos"
      echo "$outdir/videos complete"
      rm -rf "out/$dir/videos"
    fi

    # then copy across the directory and remove it to maintain disk space
    gsutil -m cp -r ./out/$dir gs://oak_bulk_data_store
    rm -rf ./out/$dir
    continue
  fi

  outdir="out/$dir/videos"
  mkdir -p "$outdir"
  tmpfile="$outdir/$filename"

  max_retries=5
  retry_delay=3
  attempt=1

  while [ "$attempt" -le "$max_retries" ]; do
    wget -q "$url" -O "$tmpfile"
    exit_code=$?

    if [ "$exit_code" -eq 0 ]; then
      break
    fi

    echo "Download failed (exit code $exit_code)... (attempt $attempt): $line"
    sleep "$retry_delay"
    attempt=$((attempt + 1))
  done

done