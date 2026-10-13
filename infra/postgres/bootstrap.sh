#!/bin/sh
set -eu
psql -X --username postgres --dbname postgres --set ON_ERROR_STOP=1 --file /bootstrap.sql
touch "$PGDATA/kms-bootstrap-complete"
