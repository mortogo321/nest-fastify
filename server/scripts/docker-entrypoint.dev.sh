#!/bin/sh

# migrations
while ! nc -z postgres 5432; do sleep 1; done;
yarn prisma:dev migrate dev

exec "$@"
