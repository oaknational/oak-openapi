#!/bin/bash

# List all -videos.tar files in oak_bulk_data_store bucket with file sizes
# Usage: ./bin/list-bulk-videos-tar.sh

BUCKET="oak_bulk_data_store"

echo "Listing all '-videos.tar' files in $BUCKET bucket:"
echo ""
printf "%-75s %s\n" "Filename" "Size"
printf "%.0s=" {1..95}
echo ""

# List all objects matching -videos.tar pattern with their sizes
gsutil ls -lh "gs://$BUCKET/**-videos.tar" 2>/dev/null | \
  grep -E 'gs://.*-videos\.tar$' | \
  awk '
  function parse_size(num, unit) {
    if (unit == "B") return num * 1
    if (unit == "KB") return num * 1024
    if (unit == "MB") return num * 1024 * 1024
    if (unit == "GiB") return num * 1024 * 1024 * 1024
    if (unit == "TiB") return num * 1024 * 1024 * 1024 * 1024
    return 0
  }

  function format_bytes(bytes) {
    if (bytes == 0) return "0 B"

    if (bytes >= 1024 * 1024 * 1024) {
      gb = bytes / (1024 * 1024 * 1024)
      return sprintf("%.2f GiB", gb)
    }

    if (bytes >= 1024 * 1024) {
      mb = bytes / (1024 * 1024)
      return sprintf("%.2f MiB", mb)
    }

    if (bytes >= 1024) {
      kb = bytes / 1024
      return sprintf("%.2f KiB", kb)
    }

    return sprintf("%d B", bytes)
  }

  {
    size_num = $1
    size_unit = $2
    path = $NF
    gsub("^gs://[^/]+/", "", path)

    size_display = $1 " " $2
    bytes = parse_size(size_num, size_unit)
    total_bytes += bytes
    count++

    printf "%-75s %s\n", path, size_display
  }

  END {
    print ""
    for (i = 1; i <= 95; i++) printf "="
    printf "\nTotal: %d files, %s\n", count, format_bytes(total_bytes)
  }
  '


# printf "%.0s=" {1..95}
# echo ""
# echo ""
# echo "Directory structure:"
# printf "%.0s=" {1..95}
# echo ""

# # Get unique directories and count files in each
# gsutil ls -lh "gs://$BUCKET/**-videos.tar" 2>/dev/null | \
#   grep -E 'gs://.*-videos\.tar$' | \
#   awk '{
#     path = $NF
#     gsub("^gs://[^/]+/", "", path)
#     dir = path
#     gsub("/[^/]*$", "", dir)
#     print dir
#   }' | sort -u | \
#   while read dir; do
#     count=$(gsutil ls -lh "gs://$BUCKET/$dir/*-videos.tar" 2>/dev/null | grep -E 'gs://.*-videos\.tar$' | wc -l)
#     echo ""
#     echo "$dir/ ($count files)"
#     gsutil ls -lh "gs://$BUCKET/$dir/*-videos.tar" 2>/dev/null | \
#       grep -E 'gs://.*-videos\.tar$' | \
#       awk -v dir="$dir" '{
#         size = $1 " " $2
#         path = $NF
#         gsub("^gs://[^/]+/", "", path)
#         gsub("^" dir "/", "", path)
#         printf "  - %-71s %s\n", path, size
#       }'
#   done
