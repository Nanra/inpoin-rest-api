#!/bin/bash
docker buildx build \
  --platform linux/amd64 \
  --tag kevinjanada/inpoin-rest-api \
  --label rest-api-inpoin-demo \
  --push \
  .

docker image prune --force --filter='label=rest-api-inpoin-demo'
