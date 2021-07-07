/* eslint @typescript-eslint/no-var-requires: "off" */
var config = require("dotenv");
config.config();

module.exports = {
    development: {
        username: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || "pass",
        database: process.env.DB_NAME || "orbita",
        host: process.env.DB_HOST || "localhost",
        dialect: "postgres"
    },
    production: {
        username: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || "pass",
        database: process.env.DB_NAME || "orbita",
        host: process.env.DB_HOST || "localhost",
        dialect: "postgres"
    },
    staging: {
        username: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || "pass",
        database: process.env.DB_NAME || "orbita",
        host: process.env.DB_HOST || "localhost",
        dialect: "postgres"
    }
};
