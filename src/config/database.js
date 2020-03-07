module.exports = {
	dialect: 'postgres',
	host: '192.168.99.100',
	// host: '127.0.0.1',
	username: 'postgres',
	password: 'docker',
	database: 'gobarber',
	define: {
		timestamps: true,
		underscored: true,
		underscoredAll: true,
	},
};
