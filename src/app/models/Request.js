import Sequelize, { Model } from 'sequelize';

class Request extends Model {
	static init(sequelize) {
		super.init(
			{
				client_ip: Sequelize.STRING,
				url: Sequelize.STRING,
				method: Sequelize.STRING,
				params: Sequelize.STRING,
				query: Sequelize.STRING,
				body: Sequelize.STRING,
			},
			{
				sequelize
			}
		);

		return this;
	}
}

export default Request;
