import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';
import User from '../models/User';

class ScheduleController {
	async index(req, res) {
		const userProvider = await User.findOne({
			where: { id: req.userId, provider: true },
		});

		if (!userProvider) {
			return res
				.status(401)
				.json({ error: 'Usuário não é um provedor de serviço' });
		}

		const date = parseISO(req.query.date);
		const startDay = startOfDay(date);
		const endDay = endOfDay(date);

		const appointments = await Appointment.findAll({
			where: {
				provider_id: req.userId,
				canceled_at: null,
				date: {
					[Op.between]: [startDay, endDay],
				},
			},
			order: ['date'],
		});

		return res.json(appointments);
	}
}

export default new ScheduleController();
