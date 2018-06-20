#!/bin/bash -e

# Healthcheck is disabled
if [[ ! -z $ENABLE_HEALTHCHECK && $ENABLE_HEALTHCHECK -eq 0 ]]; then
  exit 0
fi

# Check web services are running
curl -Ls http://localhost >/dev/null
curl -Lks https://localhost >/dev/null
