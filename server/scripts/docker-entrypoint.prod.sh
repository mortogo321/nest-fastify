#!/bin/sh

# awaiting for DB
while ! nc -z postgres 5432; do sleep 1; done;

yarn prisma:prod generate

# migration
migrate=$(yarn prisma:prod migrate status)
	
if ! [[ "$migrate" =~ "Database schema is up to date!" ]]; then
    yarn prisma:prod migrate dev
fi

exec "$@"
