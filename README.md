## Description

`fetch` response body iterator does not break when server goes away while streaming.

## Quick start

1. `git clone git@github.com:enisdenjo/node-fetch-stuck-stream.git`
1. `cd node-fetch-stuck-stream`
1. `yarn`
1. `yarn test`

## Note

This issue is exclusive to v2 of [`node-fetch`](https://github.com/node-fetch/node-fetch), it is fixed in v3.
