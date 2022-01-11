const path = require('path');
const output = path.join(__dirname, "./models");

module.exports = {
  HOST: process.env.DB_HOST,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_NAME,
  dialect: "mysql",
  logging: false,
  autoOptions: { dialect: 'mysql', directory: output, caseFile: 'l', caseModel: 'p', caseProp: 'c', useDefine: false, singularize: true, spaces: true, indentation: 2 },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};