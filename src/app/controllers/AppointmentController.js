import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';
import Mail from '../../lib/Mail';

class AppointmentController {
	async index(req, res) {
		const { page = 1 } = req.query;

		const appointments = await Appointment.findAll({
			where: {
				user_id: req.userId,
				canceled_at: null,
			},
			attributes: ['id', 'date'],
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

		return res.json(appointments);
	}

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

		/**
		 * Notificando o provedor de serviço
		 */

		const user = await User.findByPk(req.userId);

		const formattedDate = format(
			hourStart,
			"'dia' dd 'de' MMMM', às' H:mm'h'",
			{ locale: pt }
		);

		await Notification.create({
			content: `Novo agendamento de ${user.name} para ${formattedDate}`,
			user: provider_id,
		});

		return res.json(appointment);
	}

	async delete(req, res) {
		const appointment = await Appointment.findByPk(req.params.id, {
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

		if (appointment.user_id !== req.userId) {
			return res.status(401).json({
				error: 'Você não tem permissão para cancelar esse agendamento',
			});
		}

		const hourWithSub = subHours(appointment.date, 2);

		if (isBefore(hourWithSub, new Date())) {
			return res.status(401).json({
				error: 'Não é permitido cancelar um agendamento à menos de 2 horas',
			});
		}

		appointment.canceled_at = new Date();

		appointment.save();

		await Mail.sendMail({
			to: `${appointment.provider.name} <${appointment.provider.email}>`,
			subject: 'Agendamento cancelado',
			template: 'cancellation',
			context: {
				provider: appointment.provider.name,
				user: appointment.user.name,
				date: format(appointment.date, "'dia' dd 'de' MMMM', às' H:mm'h'", {
					locale: pt,
				}),
			},
		});

		return res.json(appointment);
	}
}

export default new AppointmentController();
