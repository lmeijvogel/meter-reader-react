FROM node:16-alpine3.13

RUN apk add --no-cache git bash

RUN echo "/ before COPY"
RUN ls -sla /

WORKDIR /app

RUN chown -R node:node /app

USER node

COPY package.json yarn.lock /app/

RUN echo "/ after COPY"
RUN ls -sla /

RUN echo "/app"
RUN ls -sla /app

RUN id
RUN yarn install

COPY . /app/

CMD yarn start
