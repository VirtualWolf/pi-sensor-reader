FROM node:12.16.1-alpine AS base

FROM base AS build
RUN apk add --no-cache make gcc g++ python
RUN mkdir -p /opt/build
WORKDIR /opt/build
COPY package*.json tsconfig.json ./
RUN npm install
COPY src src
RUN npm run tsc

FROM base AS release
RUN mkdir -p /opt/service && chown -R node: /opt/service
WORKDIR /opt/service
COPY --from=build /opt/build /opt/service
RUN npm prune --production && rm -r /opt/service/src /opt/service/tsconfig.json

EXPOSE 3000

CMD ["npm", "start"]

