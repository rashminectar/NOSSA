const dbConfig = require("../config/db.config");
var Sequelize = require("sequelize");
var initModels = require("./init-models").initModels;
const Op = Sequelize.Op;
// create sequelize instance with database connection
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: 0,
    logging: false,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});
// load the model definitions into sequelize

var models = initModels(sequelize);
models.sequelize = sequelize;
models.Sequelize = Sequelize;
models.Op = Op;

module.exports = models;