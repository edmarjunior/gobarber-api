import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';
import Appointment from '../models/Appointment';
import User from '../models/User';

class AppointmentController {
	async store(req, res) {
		const schema = Yup.object().shape({
			provider_id: Yup.number().required(),
			date: Yup.date().required(),
		});

		if (!(await schema.isValid(req.body))) {
			return res.status(401).json({ error: 'Dados inváidos' });
		}

		const { provider_id, date } = req.body;

		/**
		 * checando se o provider_id é um provedor
		 */

		const provider = await User.findOne({
			where: {
				id: provider_id,
				provider: true,
			},
		});

		if (!provider) {
			return res.status(401).json({ error: 'Provedor não encontrado' });
		}

		const hourStart = startOfHour(parseISO(date));

		/**
		 * Checando datas passadas
		 */
		if (isBefore(hourStart, new Date())) {
			return res.status(400).json({ error: 'Não é permitido data passada' });
		}

		/**
		 * Checando disponibilidade do provedor
		 */

		const scheduledAppointment = await Appointment.findOne({
			where: {
				provider_id,
				canceled_at: null,
				date: hourStart,
			},
		});

		if (scheduledAppointment) {
			return res.status(400).json({ error: 'Horário não disponivel' });
		}

		const appointment = await Appointment.create({
			user_id: req.userId,
			provider_id,
			date,
		});
		return res.json(appointment);
	}
}

export default new AppointmentController();