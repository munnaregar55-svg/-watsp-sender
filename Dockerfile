FROM ghcr.io/puppeteer/puppeteer:latest

WORKDIR /app

COPY --chown=pptruser:pptruser package*.json ./

RUN npm install

COPY --chown=pptruser:pptruser . .

EXPOSE 5000

CMD ["node", "server.js"]
