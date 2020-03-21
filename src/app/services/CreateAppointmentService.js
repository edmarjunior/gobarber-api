import { startOfHour, parseISO, isBefore, format } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';
import User from '../models/User';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notification';
import Cache from '../../lib/Cache';

class CreateAppointmentService {
	async run({ provider_id, date, user_id }) {
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
			throw new Error('Provedor não encontrado');
		}

		const hourStart = startOfHour(parseISO(date));

		/**
		 * Checando datas passadas
		 */
		if (isBefore(hourStart, new Date())) {
			throw new Error('Não é permitido data passada');
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
			throw new Error('Horário não disponivel');
		}

		const appointment = await Appointment.create({
			user_id,
			provider_id,
			date,
		});

		/**
		 * Notificando o provedor de serviço
		 */

		const formattedDate = format(
			hourStart,
			"'dia' dd 'de' MMMM', às' H:mm'h'",
			{ locale: pt }
		);

		const user = await User.findByPk(user_id);

		await Notification.create({
			content: `Novo agendamento de ${user.name} para ${formattedDate}`,
			user: provider_id,
		});

		/**
		 * Invalidando cache
		 */

		await Cache.invalidatePrefix(`user:${user_id}:appointments`);

		return appointment;
	}
}

export default new CreateAppointmentService();
