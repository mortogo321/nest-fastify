#!/bin/sh

# migrations
while ! nc -z postgres 5432; do sleep 1; done;
yarn prisma:prod generate
yarn prisma:prod migrate deploy

exec "$@"
