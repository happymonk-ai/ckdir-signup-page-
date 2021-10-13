
FROM node:12

WORKDIR /src
ADD package.json .
RUN npm install

ADD . .

