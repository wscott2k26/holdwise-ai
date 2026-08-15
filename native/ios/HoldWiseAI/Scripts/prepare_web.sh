#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IOS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$IOS_ROOT/../../.." && pwd)"
WWW_DIR="$IOS_ROOT/Resources/www"

cd "$REPO_ROOT"

if [[ ! -d node_modules ]]; then
  echo "Installing web dependencies..."
  npm install --no-audit --no-fund
fi

rm -rf dist
npm run build:native
rm -rf "$WWW_DIR"
mkdir -p "$WWW_DIR"
cp -R dist/. "$WWW_DIR/"
node scripts/inline-native-web.mjs "$WWW_DIR"
node scripts/verify-native-web.mjs "$WWW_DIR"
printf 'Bundled hardened web app into %s\n' "$WWW_DIR"
