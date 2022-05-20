#!/bin/bash
docker buildx build \
  --platform linux/amd64 \
  --tag nanrasukedy/rest-api-inpoin-demo \
  --label rest-api-inpoin-demo \
  --push \
  .

docker image prune --force --filter='label=rest-api-inpoin-demo'