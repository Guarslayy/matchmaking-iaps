#!/usr/bin/env bash
set -euo pipefail

node scripts/reset-demo-db.mjs
node scripts/demo-run.mjs
