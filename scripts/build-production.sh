#!/usr/bin/env bash
set -euo pipefail

# Build a signed production .aab using local keystore credentials.
# credentials.json must be present at the project root.
# Run from the project root: ./scripts/build-production.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

if [ ! -f credentials.json ]; then
  echo "Error: credentials.json not found at project root."
  echo "Make sure the keystore backup folder is present and credentials.json is configured."
  exit 1
fi

echo "Starting EAS production build (Android AAB) with local credentials..."
eas build \
  --platform android \
  --profile production \
  --non-interactive

echo "Build submitted. Monitor progress at:"
echo "https://expo.dev/accounts/devdhar.s/projects/crostic/builds"
