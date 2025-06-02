#!/bin/sh
set -euo pipefail
PACKAGES=""
for pkg in "$@"; do
  if ! rpm -q "$pkg" >/dev/null 2>&1; then
    PACKAGES="$PACKAGES $pkg"
  fi
done

echo "Installing packages:$PACKAGES"
dnf install -y $PACKAGES