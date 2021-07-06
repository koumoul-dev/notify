FROM koumoul/webapp-base:1.10.1
MAINTAINER "contact@koumoul.com"

ARG VERSION
ENV VERSION=$VERSION
ENV NODE_ENV production

WORKDIR /webapp
ADD package.json .
ADD package-lock.json .
RUN npm install --production && node-prune
ADD nodemon.json .

ADD contract contract
ADD config config

# Adding UI files
ADD i18n i18n
ADD public public
ADD nuxt.config.js .
RUN npm run build

# Adding server files
ADD server server

ADD README.md .

VOLUME /webapp/security
EXPOSE 8080

CMD ["node", "server"]
