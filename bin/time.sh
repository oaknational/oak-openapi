#!/bin/bash

if [ -z "$API_KEY" ]; then
  echo "Error: API_KEY is not set in the environment."
  exit 1
fi

curl -o /dev/null -s -D - -o /dev/null -w "DNS lookup: %{time_namelookup}s
TCP connect: %{time_connect}s
TLS handshake: %{time_appconnect}s
Server processing: %{time_pretransfer}s
Time to first byte: %{time_starttransfer}s
Total time: %{time_total}s\n" \
-H 'accept: application/json' \
-H "authorization: bearer ${API_KEY}" $1