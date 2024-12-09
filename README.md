# NestJS - Fastify
- NestJS + Fastify
- PostgeSQL
- RabbitMQ

## Required
- Yarn: https://classic.yarnpkg.com/lang/en/docs/install
- NetsJS CLI: https://docs.nestjs.com/cli/overview  
- dotenvx: https://github.com/dotenvx/dotenvx

```bash
yarn global add @nestjs/cli
yarn global add @dotenvx/dotenvx
```

## Development
```bash
git clone https://github.com/mortogo321/nest-fastify.git
cd nest-fastify
yarn
```

## Dockerize
```bash
# up
docker compose -f "docker/compose.dev.yml" up -d --build

# down
docker compose -f "docker/compose.dev.yml" down --rmi all --remove-orphans
```

## Scripts
```bash
# prisma command
yarn prisma:dev generate
yarn prisma:dev migrate dev --name init
yarn prisma:dev db push
```

## Environment Variables
Global: `.env.{dev | prod}`  
Service: `apps/{service-name}/.env.{dev | prod}`  

## Services
api - http://localhost:8000  
auth - http://localhost:8001  
alert - http://localhost:8002  
payment - http://localhost:8003  

## Management Tools
RabbitMQ: http://localhost:15672  
```
u: admin
p: Password@01
```

MailHog: http://localhost:8025  

## Documents
http://localhost:{service-port}/docs  
