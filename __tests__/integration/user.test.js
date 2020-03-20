/* eslint-disable no-undef */

import request from 'supertest';
import app from '../../src/app';
import truncate from '../util/truncate';
import factory from '../factories';

describe('User', () => {
	beforeEach(async () => {
		await truncate();
	});

	it('Deve ser possível realizar o cadastro', async () => {
		const user = await factory.attrs('User');

		const response = await request(app)
			.post('/users')
			.send(user);

		expect(response.body).toHaveProperty('id');
	});

	it('Não deve permitir cadastrar usuário com e-mail já existente', async () => {
		const user = await factory.attrs('User');

		await request(app)
			.post('/users')
			.send(user);

		const response = await request(app)
			.post('/users')
			.send(user);

		expect(response.status).toBe(400);
	});

	it('Deve validar o password_hash', async () => {
		const user = await factory.create('User', {
			password: '123456',
		});

		const compare = await user.checkPassword('123456');
		expect(compare).toBe(true);
	});
});
