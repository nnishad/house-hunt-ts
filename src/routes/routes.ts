import { Router } from 'express';
import { userRoutes } from './controllers/userController';
import { alertRouter } from './controllers/alertController';
const router = Router();

router.use('/user', userRoutes);
router.use('/alerts', alertRouter);

export default router;
