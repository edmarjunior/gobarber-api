import { Router } from 'express';
import multer from 'multer';
import Brute from 'express-brute';
import BruteRedis from 'express-brute-redis';

import UserController from './app/controllers/UserController';
import SessionControler from './app/controllers/SessionController';
import storeRequest from './app/middlewares/storeRequest';
import authMiddleware from './app/middlewares/auth';
import multerConfig from './config/multer';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';
import AvailableController from './app/controllers/AvailableController';
import validateUserStore from './app/validators/UserStore';
import validateUserUpdate from './app/validators/UserUpdate';
import validateAppointmentStore from './app/validators/AppointmentStore';
import validateSessionStore from './app/validators/SessionStore';

const routes = new Router();
const upload = multer(multerConfig);

const bruteStore = new BruteRedis({
	host: process.env.REDIS_HOST,
	port: process.env.REDIS_PORT,
});

const bruteForce = new Brute(bruteStore);

routes.use(storeRequest);

// rota de ping
routes.get('/', (req, res) =>
	res.json({ currentDate: new Date().toLocaleTimeString() })
);

routes.post('/users', validateUserStore, UserController.store);

routes.post(
	'/sessions',
	bruteForce.prevent,
	validateSessionStore,
	SessionControler.store
);

routes.use(authMiddleware);


routes.post(
	'/appointments',
	validateAppointmentStore,
	AppointmentController.store
);

routes.get('/appointments', AppointmentController.index);
routes.delete('/appointments/:id', AppointmentController.delete);

routes.put('/users', validateUserUpdate, UserController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.get('/providers', ProviderController.index);
routes.get('/providers/:id/available', AvailableController.index);

routes.get('/schedule', ScheduleController.index);

routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

export default routes;
