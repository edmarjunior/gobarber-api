import User from '../models/User';
import File from '../models/File';
import Cache from '../../lib/Cache';

class UserController {
	async store(req, res) {
		const existUser = await User.findOne({ where: { email: req.body.email } });

		if (existUser) {
			return res.status(400).json({ error: 'E-mail de usuário já existente' });
		}

		const { id, name, email, provider } = await User.create(req.body);

		if (provider) {
			await Cache.invalidate('providers');
		}

		return res.json({
			id,
			name,
			email,
			provider,
		});
	}

	async update(req, res) {
		const { email, oldPassword } = req.body;
		const user = await User.findByPk(req.userId);
		if (user.email !== email) {
			const existUser = await User.findOne({ where: { email } });
			if (existUser) {
				return res
					.status(401)
					.json({ error: 'E-mail de usuário já existente' });
			}
		}

		if (oldPassword && !(await user.checkPassword(oldPassword))) {
			return res.status(401).json({ error: 'senha incorreta' });
		}

		await user.update(req.body, {
			where: { id: req.userId },
		});

		const { id, name, avatar } = await User.findByPk(req.userId, {
			include: [
				{
					model: File,
					as: 'avatar',
					attributes: ['id', 'path', 'url'],
				},
			],
		});

		return res.json({
			id,
			name,
			email,
			avatar,
		});
	}
}

export default new UserController();
