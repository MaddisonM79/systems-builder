#!/usr/bin/env bash
set -e

BUMP=${1:-patch}   # patch | minor | major

if [[ "$BUMP" != "patch" && "$BUMP" != "minor" && "$BUMP" != "major" ]]; then
  echo "Usage: pnpm bump:api [patch|minor|major]"
  exit 1
fi

ROOT=$(git rev-parse --show-toplevel)

cd "$ROOT/src/api"
npm version "$BUMP" --no-git-tag-version
VERSION=$(node -p "require('./package.json').version")

cd "$ROOT"
git add src/api/package.json
git commit -m "release(api): v$VERSION"
git tag "api-v$VERSION"
git push && git push --tags

echo "Tagged and pushed api-v$VERSION"
