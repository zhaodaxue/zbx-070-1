FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY .npmrc* ./

RUN npm install --production=false || npm install

COPY . .

RUN npm run build

ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=/app/data/pinyutuan.db

EXPOSE 3001

CMD ["node", "--import", "tsx", "api/server.ts"]
