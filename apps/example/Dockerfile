FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY dist ./dist

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
