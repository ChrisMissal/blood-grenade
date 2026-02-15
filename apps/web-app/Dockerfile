FROM node:20-alpine

WORKDIR /app

ARG ORG_OPENCONTAINERS_IMAGE_VERSION
ARG ORG_OPENCONTAINERS_IMAGE_REVISION
ARG ORG_OPENCONTAINERS_IMAGE_CREATED
ARG ORG_OPENCONTAINERS_IMAGE_SOURCE

LABEL org.opencontainers.image.version=$ORG_OPENCONTAINERS_IMAGE_VERSION \
      org.opencontainers.image.revision=$ORG_OPENCONTAINERS_IMAGE_REVISION \
      org.opencontainers.image.created=$ORG_OPENCONTAINERS_IMAGE_CREATED \
      org.opencontainers.image.source=$ORG_OPENCONTAINERS_IMAGE_SOURCE

COPY package.json ./
COPY dist ./dist

ENV NODE_ENV=production

CMD ["node", "dist/index.js", "--healthcheck"]
