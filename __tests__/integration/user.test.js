/* eslint-disable no-undef */

import request from 'supertest';
import app from '../../src/app';
import truncate from '../util/truncate';
import User from '../../src/app/models/User';

describe('User', () => {
	beforeEach(async () => {
		await truncate();
	});

	it('Deve ser possível realizar o cadastro', async () => {
		const response = await request(app)
			.post('/users')
			.send({
				name: 'Edmar',
				email: 'edmar2@smn.com.br',
				password: '123456',
			});
		expect(response.body).toHaveProperty('id');
	});

	it('Não deve permitir cadastrar usuário com e-mail já existente', async () => {
		await request(app)
			.post('/users')
			.send({
				name: 'Edmar',
				email: 'edmar2@smn.com.br',
				password: '123456',
			});

		const response = await request(app)
			.post('/users')
			.send({
				name: 'Edmar',
				email: 'edmar2@smn.com.br',
				password: '123456',
			});

		expect(response.status).toBe(400);
	});

	it('Deve validar o password_hash', async () => {
		const user = await User.create({
			name: 'Edmar',
			email: 'edmar2@smn.com.br',
			password: '123456',
		});

		const compare = await user.checkPassword('123456');
		expect(compare).toBe(true);
	});
});
