FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ARG var
ENV var = ${var}

CMD ["node", "./src/bot.js"]