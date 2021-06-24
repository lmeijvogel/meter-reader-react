FROM node:16-alpine3.13

RUN apk add --no-cache git bash

WORKDIR /app

RUN chown -R node:node /app

USER node

COPY package.json yarn.lock /app/

RUN yarn install

COPY . /app/

CMD yarn start
