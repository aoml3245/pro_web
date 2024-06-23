FROM node

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY --chown=node:node . .
USER node
RUN npm install
RUN npm install axios
EXPOSE 3000
CMD [ "npm", "run", "dev" ]
