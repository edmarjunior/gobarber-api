import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import CreateAppointmentService from '../services/CreateAppointmentService';
import CancelAppointmentService from '../services/CancelAppointmentService';
import Cache from '../../lib/Cache';

class AppointmentController {
	async index(req, res) {
		const { page = 1 } = req.query;

		const cacheKey = `user:${req.userId}:appointments:${page}`;
		const cached = await Cache.get(cacheKey);

		if (cached) {
			return res.json(cached);
		}

		const appointments = await Appointment.findAll({
			where: {
				user_id: req.userId,
				canceled_at: null,
			},
			attributes: ['id', 'date', 'past', 'cancelable'],
			order: ['date'],
			limit: 10,
			offset: (page - 1) * 10,
			include: [
				{
					model: User,
					as: 'provider',
					attributes: ['id', 'name'],
					include: [
						{
							model: File,
							as: 'avatar',
							attributes: ['id', 'path', 'url'],
						},
					],
				},
			],
		});

		await Cache.set(cacheKey, appointments);

		return res.json(appointments);
	}

	async store(req, res) {
		const { provider_id, date } = req.body;

		const appointment = await CreateAppointmentService.run({
			provider_id,
			date,
			user_id: req.userId,
		});

		return res.json(appointment);
	}

	async delete(req, res) {
		const appointment = await CancelAppointmentService.run({
			id: req.params.id,
			userId: req.userId,
		});

		return res.json(appointment);
	}
}

export default new AppointmentController();
