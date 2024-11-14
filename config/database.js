// const { Sequelize } = require('sequelize');
// require('dotenv').config();

// const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
//   host: process.env.DB_HOST || 'localhost',
//   dialect: 'mysql',
//   logging: false, 
// });

// sequelize.authenticate()
//   .then(() => {
//     console.log('Connection to the MySQL database has been established successfully.');
//   })
//   .catch((error) => {
//     console.error('Unable to connect to the MySQL database:', error);
//   });

// module.exports = sequelize;




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
