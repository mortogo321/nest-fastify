ARG IMAGE=node:alpine

# build
FROM ${IMAGE} AS builder

WORKDIR /app

COPY ../server .

RUN yarn global add @nestjs/cli
RUN yarn global add @dotenvx/dotenvx
RUN yarn

# development
FROM builder AS dev

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

RUN yarn prisma:dev generate

CMD [ "" ]

# build production
FROM builder AS build-prod

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

RUN yarn prisma:prod generate
RUN yarn prisma:prod migrate deploy
RUN yarn build

# production
FROM ${IMAGE} AS prod

USER node

WORKDIR /app

COPY --from=build-prod /app/dist ./dist

CMD [ "" ]
