#!/usr/bin/env bash
# Run database migrations, then launch the server (CMD).
set -euo pipefail

echo ">> Applying database migrations (all service branch heads)"
alembic upgrade heads

echo ">> Starting: $*"
exec "$@"
