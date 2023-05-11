import express from 'express';
import logger from './custom-logger';
import router from './routes/routes';

const app = express();

const routes = express.Router();

routes.use(router);

app.listen(3001, () => {
  logger.info('Server started on port 3001');
});
