FROM node:18-alpine

WORKDIR /usr/src/app

COPY src/ ./

EXPOSE 8000

CMD [ "node", "server.js" ]
