module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Users', 'index_name');
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('Users', ['field_name']);
  }
};

// ksaaslakasand
// ne