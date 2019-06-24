const dotenv = require('dotenv');
const result = dotenv.config();
if (result.error) {
    throw result.error;
}
const { parsed: envs } = result;
if(envs.NODE_ENV == "development")
{
    console.log(envs);
}
module.exports = envs;
