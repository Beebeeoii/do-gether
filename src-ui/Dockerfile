FROM node:latest

LABEL author="Jia Wei <b33b33o11@gmail.com>"

WORKDIR /app

COPY package.json .

RUN npm install

RUN npm install -g serve

COPY . .

CMD ["serve", "-s", "build"]
