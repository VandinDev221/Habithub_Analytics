#!/bin/sh
set -e
npm run build 2>/dev/null || true
exec node dist/index.js
