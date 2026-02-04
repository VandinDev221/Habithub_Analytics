#!/bin/sh
set -e
cd backend
npm ci
npm run build
exec npm run start
