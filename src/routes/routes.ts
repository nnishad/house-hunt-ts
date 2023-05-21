import { Router } from 'express';
import { alertRouter } from './controllers/alertController';
const router = Router();

router.use('/alert', alertRouter);

export default router;
