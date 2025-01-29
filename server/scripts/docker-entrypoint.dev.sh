#!/bin/sh

# awaiting for DB
while ! nc -z postgres 5432; do sleep 1; done;

yarn prisma:dev generate

# migration
migrate=$(yarn prisma:dev migrate status)
	
if ! [[ "$migrate" =~ "Database schema is up to date!" ]]; then
    yarn prisma:dev migrate dev
fi

exec "$@"
