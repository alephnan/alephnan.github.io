#!/usr/bin/env bash
set -euo pipefail

# Pinned Linux x86_64 release used locally and by GitHub Actions.
version=$(cat .zola-version)
checksum=54d1a347781b2f32330914fcc02def81c7e3ddb6111b36d1cc89c06557aed1de
mkdir -p .tools
archive=$(mktemp .tools/zola-download.XXXXXX)
trap 'rm -f "$archive"' EXIT
curl --fail --location --retry 2 \
  "https://github.com/getzola/zola/releases/download/v${version}/zola-v${version}-x86_64-unknown-linux-gnu.tar.gz" \
  --output "$archive"
printf '%s  %s\n' "$checksum" "$archive" | sha256sum --check --status
tar -xzf "$archive" -C .tools zola
.tools/zola --version
