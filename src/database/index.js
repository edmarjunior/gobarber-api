import Sequelize from 'sequelize';
import mongoose from 'mongoose';
import databaseConfig from '../config/database';
import User from '../app/models/User';
import File from '../app/models/File';
import Appointment from '../app/models/Appointment';
import Request from '../app/models/Request';

const models = [User, File, Appointment, Request];

class Database {
	constructor() {
		this.init();
		if (process.env.NODE_ENV !== 'test') {
			this.mongo();
		}
	}

	init() {
		this.connection = new Sequelize(databaseConfig);
		models
			.map(model => model.init(this.connection))
			.map(model => model.associate && model.associate(this.connection.models));
	}

	mongo() {
		this.mongoConnection = mongoose.connect(process.env.MONGO_URL, {
			useNewUrlParser: true,
			useFindAndModify: true,
		});
	}
}

export default new Database();
