# notify
A simple server to manage notifications feeds for our users. Notifications are stored and pushed to various channels.

## Development

```
docker-compose up -d
sh scripts/init.sh
npm run dev-client
npm run dev-server
docker-compose exec router sh -c "mongo < /scripts/init-sharding.js"
```
