#!/bin/bash
docker buildx build \
  --platform linux/amd64 \
  --tag kevinjanada/inpoin-rest-api \
  --label inpoin-rest-api \
  --push \
  .

docker image prune --force --filter='label=inpoin-rest-api'