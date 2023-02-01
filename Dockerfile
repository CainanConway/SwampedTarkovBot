FROM node:alpine

ARG arg1
ENV token $arg1

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["node", "./src/bot.js"]