module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('DepositWithdraws', 'date', {
      type: Sequelize.DATE,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('DepositWithdraws', 'date');
  }
};
