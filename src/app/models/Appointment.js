import Sequelize, { Model } from 'sequelize';

class Appointment {
	static init(sequelize) {
		super.init({
			date: Sequelize.DATE,
			canceled_at: Sequelize.DATE
		})
	}

	static associate(models) {
		this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
		this.belongsTo(model.User, { foreignKey: 'provider_id', as: 'provider' })
	}
}
