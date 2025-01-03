FROM node:lts-alpine
ENV NODE_ENV=production
ENV TZ="Asia/Jakarta"
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../ && chown -R node /usr/src/app
COPY . .
EXPOSE 6789
USER node

CMD ["node", "index.js"]