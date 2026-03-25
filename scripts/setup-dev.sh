#!/usr/bin/env bash
# Run once after cloning on a new machine.
# Generates .claude/launch.json with paths for the current environment.
set -e

cd "$(git rev-parse --show-toplevel)"

# ── Node ──────────────────────────────────────────────────────────────────────
# Resolve via nvm (most reliable even if node is on PATH via nvm)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
NODE_BIN=$(which node 2>/dev/null || true)
if [ -z "$NODE_BIN" ]; then
  echo "Error: node not found. Install Node.js via nvm or https://nodejs.org" >&2
  exit 1
fi
echo "node: $NODE_BIN"

# Create a stable ~/bin/node symlink so the preview tool can find node
# without needing shell init (nvm). Re-run after upgrading node versions.
mkdir -p "$HOME/bin"
ln -sf "$NODE_BIN" "$HOME/bin/node"
echo "symlink: ~/bin/node -> $NODE_BIN"
# Use the stable symlink path in launch.json so it survives minor updates
NODE_BIN="$HOME/bin/node"

# ── pnpm ──────────────────────────────────────────────────────────────────────
# Ensure deps are installed
"$NODE_BIN" --version > /dev/null
PNPM_BIN=$(which pnpm 2>/dev/null || "$NODE_BIN" -e "require('child_process').execSync('which pnpm', {stdio:'pipe'})" 2>/dev/null || true)
if [ -z "$PNPM_BIN" ]; then
  echo "Installing pnpm..."
  "$NODE_BIN" -e "require('child_process').execSync('npm install -g pnpm', {stdio:'inherit'})"
  PNPM_BIN=$(which pnpm)
fi
"$PNPM_BIN" install --frozen-lockfile

# ── Binary paths via pnpm ─────────────────────────────────────────────────────
WRANGLER_JS=$(cd src/api && "$NODE_BIN" -e "const b=require.resolve('wrangler/bin/wrangler.js'); console.log(b)")
VITE_JS=$(cd src/app && "$NODE_BIN" -e "const b=require.resolve('vite/bin/vite.js'); console.log(b)")
echo "wrangler: $WRANGLER_JS"
echo "vite:     $VITE_JS"

# ── Create start scripts (work around sandbox getcwd issue) ───────────────────
mkdir -p .claude
cat > .claude/start-api.sh << SCRIPT
#!/bin/bash
cd /
export NVM_DIR="\$HOME/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && source "\$NVM_DIR/nvm.sh"
cd "$(git rev-parse --show-toplevel)"
exec "$PNPM_BIN" --filter @system-builder/api dev
SCRIPT

cat > .claude/start-app.sh << SCRIPT
#!/bin/bash
cd /
export NVM_DIR="\$HOME/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && source "\$NVM_DIR/nvm.sh"
cd "$(git rev-parse --show-toplevel)"
exec "$PNPM_BIN" --filter @system-builder/app dev
SCRIPT

chmod +x .claude/start-api.sh .claude/start-app.sh

# ── Write launch.json ─────────────────────────────────────────────────────────
cat > .claude/launch.json << JSON
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "app",
      "runtimeExecutable": "$NODE_BIN",
      "runtimeArgs": ["$VITE_JS", "$(git rev-parse --show-toplevel)/src/app"],
      "port": 5173
    },
    {
      "name": "api",
      "runtimeExecutable": "$NODE_BIN",
      "runtimeArgs": ["$WRANGLER_JS", "dev", "--config", "$(git rev-parse --show-toplevel)/src/api/wrangler.toml"],
      "port": 8787
    }
  ]
}
JSON

echo ""
echo "✓ .claude/launch.json generated"
echo "  Re-run this script after: nvm install <new-version> or pnpm update"
