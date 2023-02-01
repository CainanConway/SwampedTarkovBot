FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ARG var
ENV token = ${var}

CMD ["node", "./src/bot.js"]