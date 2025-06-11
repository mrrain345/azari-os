#!/bin/sh
set -euo pipefail
cd $(dirname $(readlink -f "$0"))

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <action> [version]"
  echo "Actions: build, switch, dry"
  exit 1
fi

IMAGE="docker.io/mrrain345/azari"
ACTION=$1
VERSION=${2:-next}

if [ "$VERSION" = "next" ]; then
  PREFIX=$(date --utc +%y.%-m.)
  LAST=$(skopeo inspect docker://$IMAGE:latest | jq -r "[.RepoTags[] | select(startswith(\"$PREFIX\")) | split(\".\") | .[2] | tonumber] | sort | last")
  if [ "$LAST" = "null" ]; then
    VERSION=${PREFIX}0
  else
    VERSION="${PREFIX}$((LAST+1))"
  fi
fi

echo "Building $IMAGE:$VERSION"

if (skopeo inspect docker://$IMAGE:$VERSION >/dev/null 2>&1); then
  echo "Version $VERSION already exists for $IMAGE"
  exit 1
fi

BUILD_DIR=$(mktemp -d /tmp/azari-build-XXXXXX)
ACTIONS=(build upgrade dry)
echo "Using build directory: $BUILD_DIR"

if ! echo "${ACTIONS[@]}" | grep -q "\b$ACTION\b"; then
  echo "Invalid action: $ACTION"
  echo "Valid actions: ${ACTIONS[*]}"
  exit 1
fi


podman build \
  --output=$BUILD_DIR \
  --build-arg=VERSION=$VERSION \
  -f Containerfile .

if [ "$ACTION" = "dry" ]; then
  echo "DRY RUN: Containerfile content for $IMAGE:$VERSION"
  echo -e "\n----------------------------------------\n"
  cat $BUILD_DIR/Containerfile
  rm -rf $BUILD_DIR
  exit 0
fi

podman build \
  --security-opt=label=disable \
  --cap-add=all \
  --device /dev/fuse \
  -f $BUILD_DIR/Containerfile \
  -t $IMAGE:$VERSION \
  -t $IMAGE:latest $BUILD_DIR

rm -rf $BUILD_DIR
podman push $IMAGE:$VERSION
podman push $IMAGE:latest

if [ $ACTION = "upgrade" ]; then
  bootc upgrade
fi
