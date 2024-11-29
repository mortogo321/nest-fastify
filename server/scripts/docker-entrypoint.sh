#!/bin/sh

# migrations
yarn prisma:prod migrate deploy

exec "$@"
