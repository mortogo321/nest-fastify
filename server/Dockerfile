# base
FROM node:alpine AS base

RUN apk update
RUN apk add --no-cache libc6-compat

RUN yarn global add @nestjs/cli
RUN yarn global add @dotenvx/dotenvx

# build
FROM base AS builder

WORKDIR /app

# development
FROM builder AS dev

WORKDIR /app

ENTRYPOINT [ "sh", "scripts/docker-entrypoint.dev.sh" ]

CMD [ "" ]

# production
FROM builder AS prod

WORKDIR /app

COPY ../server .

RUN yarn

ENTRYPOINT [ "sh", "scripts/docker-entrypoint.prod.sh" ]

CMD [ "" ]
