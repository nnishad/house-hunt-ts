import express from 'express';
import logger from './custom-logger';
import router from './routes/routes';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swaggerConfig';
const app = express();

// Middleware to parse request body as JSON
app.use(express.json());

app.use(router);

app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
// Swagger UI setup
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true }),
);

// Define the MongoDB connection URL
const MONGODB_URI =
  'mongodb+srv://nikhilnishad:gznbo2yqBooKxWWA@cluster0.sv60irs.mongodb.net/?retryWrites=true&w=majority';

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as mongoose.ConnectOptions)
  .then(() => {
    logger.info('Connected to MongoDB');
    app.listen(3001, () => {
      logger.info('Server is running on port 3001');
    });
  })
  .catch((error) => {
    logger.info('Failed to connect to MongoDB', error);
  });
