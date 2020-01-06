// see https://www.mongodb.com/blog/post/on-selecting-a-shard-key-for-mongodb

sh.enableSharding('notify-development')

// good for read targeting and locality
sh.shardCollection('notify-development.notifications', { 'recipient.id': 1, date: 1 })
