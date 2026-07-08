# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
RUN yarn build
# Develop stage
FROM node:20-alpine AS develop
WORKDIR /app
ENV NODE_ENV=development
COPY package*.json ./
RUN yarn install
COPY . .
EXPOSE 3001
CMD ["yarn", "start:dev"]