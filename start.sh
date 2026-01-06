#!/bin/sh
set -e

echo "🔄 Synchronisiere Datenbank-Schema..."

# Prisma db push (ohne Client zu regenerieren, da bereits bei Build geschehen)
node node_modules/prisma/build/index.js db push --skip-generate

echo "✅ Datenbank-Schema synchronisiert!"
echo "🚀 Starte ST Motors..."

# Server starten
exec node server.js

