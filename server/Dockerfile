# base
FROM node:alpine AS base

RUN apk add --no-cache libc6-compat openssl

RUN yarn global add @nestjs/cli
RUN yarn global add @dotenvx/dotenvx

# build
FROM base AS builder

WORKDIR /app

# development
FROM builder AS dev

WORKDIR /app

ENTRYPOINT [ "/bin/sh", "scripts/docker-entrypoint.dev.sh" ]

CMD [ "" ]

# production
FROM builder AS prod

WORKDIR /app

COPY ../server .
RUN yarn

ENTRYPOINT [ "/bin/sh", "scripts/docker-entrypoint.prod.sh" ]

CMD [ "" ]
