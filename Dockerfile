FROM arm32v6/node:12.16.2-alpine AS base

FROM base AS build
RUN apk add --no-cache make gcc g++ python
RUN mkdir -p /opt/build
WORKDIR /opt/build
COPY package*.json tsconfig.json ./
RUN npm install
COPY src src
RUN npm run compile

FROM base AS release
RUN mkdir -p /opt/service && chown -R node: /opt/service
# 997 is the "gpio" groupId on the Raspbian host and allows access to /dev/gpiomem
RUN addgroup -g 997 gpio
RUN adduser node gpio
USER node
WORKDIR /opt/service
COPY --from=build --chown=node:node /opt/build /opt/service
RUN npm prune --production && rm -r /opt/service/src /opt/service/tsconfig.json

EXPOSE 3000

CMD ["npm", "start"]
