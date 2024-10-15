const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('Dataentry_DB', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false, 
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection to the MySQL database has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the MySQL database:', error);
  });

module.exports = sequelize;
