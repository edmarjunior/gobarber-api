import Appointment from '../models/Appointment';

class AppointmentController {
	async store(req, res) {
		const appointment = await Appointment.create(req.body);
		return res.json(appointment);
	}
}

export default new AppointmentController();
