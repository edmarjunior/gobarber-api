import AvailableService from '../services/AvailableService';

class AvailableController {
	async index(req, res) {
		const { date } = req.query;

		if (!date) {
			return res.status(400).json('Data inválida');
		}

		const available = await AvailableService.run({
			provider_id: req.params.id,
			date: Number(date),
		});

		return res.json(available);
	}
}

export default new AvailableController();
