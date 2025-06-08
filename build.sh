#!/bin/sh
set -euo pipefail
cd $(dirname $(readlink -f "$0"))

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <version> [<action>]"
  echo "Actions: build, switch, dry"
  exit 1
fi

IMAGE="docker.io/mrrain345/azari"
VERSION=$1
ACTION=${2:-build}
CONTAINERFILE=$(mktemp /tmp/azari-build.XXXXXX)
ACTIONS=(build switch dry)


if ! echo "${ACTIONS[@]}" | grep -q "\b$ACTION\b"; then
  echo "Invalid action: $ACTION"
  echo "Valid actions: ${ACTIONS[*]}"
  exit 1
fi

if [ $ACTION = "dry" ]; then
  rm -f $CONTAINERFILE
  deno run --allow-read=. build/main.ts manifest.yaml $VERSION
  exit 0
fi

if [ ! -f "/usr/local/bin/sass" ]; then
  echo "Sass not found, installing..."
  npm install --cache $(mktemp -d) -g sass
fi

ags bundle ./shell/app.ts ./shell/astal-shell

echo "Creating temp containerfile: $CONTAINERFILE"
deno run --allow-read=. ./build/main.ts manifest.yaml $VERSION > $CONTAINERFILE


podman build \
  --security-opt=label=disable \
  --cap-add=all \
  --device /dev/fuse \
  -f $CONTAINERFILE \
  -t $IMAGE:$VERSION \
  -t $IMAGE:latest .

rm -f $CONTAINERFILE
podman push $IMAGE:$VERSION
podman push $IMAGE:latest

if [ $ACTION = "switch" ]; then
  bootc switch --transport containers-storage $IMAGE:latest
fi
