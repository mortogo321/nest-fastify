ARG IMAGE=node:alpine

# base
FROM ${IMAGE} AS base

RUN yarn global add @nestjs/cli
RUN yarn global add @dotenvx/dotenvx

# build
FROM base AS builder

WORKDIR /app

COPY ../server .

RUN yarn

# development
FROM builder AS dev

WORKDIR /app

RUN yarn prisma:dev generate

CMD [ "" ]

# production
FROM builder AS prod

WORKDIR /app

RUN yarn prisma:prod generate

ENTRYPOINT [ "/bin/sh", "scripts/docker-entrypoint.sh" ]

CMD [ "" ]
