#!/bin/sh

FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN npm run build

COPY . .

CMD ["node", "dist/main"]
