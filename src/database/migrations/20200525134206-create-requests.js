'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {

		return queryInterface.createTable('requests', {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			client_ip: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			url: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			method: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			params: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			query: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			body: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			updated_at: {
				type: Sequelize.DATE,
				allowNull: false,
			},
		});
	},

	down: queryInterface => {
		return queryInterface.dropTable('requests');
	}
};
