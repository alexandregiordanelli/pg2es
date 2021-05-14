FROM node
WORKDIR /usr/app
COPY . .
CMD [ "node", "index" ]