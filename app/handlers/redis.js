const { REDIS_HOST, REDIS_PORT, REDIS_EXPIRES } = require('../../config');
const cache = require('express-redis-cache')({
    host: REDIS_HOST,
    port: REDIS_PORT,
    expires: REDIS_EXPIRES
});

module.exports = cache;
