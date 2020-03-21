import { subHours, isBefore } from 'date-fns';
import Appointment from '../models/Appointment';
import User from '../models/User';
import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';
import Cache from '../../lib/Cache';

class CancelAppointmentService {
	async run({ id, userId }) {
		const appointment = await Appointment.findByPk(id, {
			include: [
				{
					model: User,
					as: 'provider',
					attributes: ['name', 'email'],
				},
				{
					model: User,
					as: 'user',
					attributes: ['name'],
				},
			],
		});

		if (appointment.user_id !== userId) {
			throw new Error('Você não tem permissão para cancelar esse agendamento');
		}

		const hourWithSub = subHours(appointment.date, 2);

		if (isBefore(hourWithSub, new Date())) {
			throw new Error(
				'Não é permitido cancelar um agendamento à menos de 2 horas'
			);
		}

		appointment.canceled_at = new Date();

		appointment.save();

		await Queue.add(CancellationMail.key, { appointment });

		/**
		 * Invalidando cache
		 */

		await Cache.invalidatePrefix(`user:${userId}:appointments`);

		return appointment;
	}
}

export default new CancelAppointmentService();
