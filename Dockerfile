#!/bin/sh

FROM node:14-alpine

WORKDIR /usr/src/app

COPY package*.json ./

COPY . .

RUN npm install

RUN npm run build

CMD ["node", "dist/main"]
