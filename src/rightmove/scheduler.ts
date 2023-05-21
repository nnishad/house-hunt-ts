import cron from 'node-cron';
import logger from '../custom-logger';
import Alert from '../models/alert';
import { fetchProperties } from './property-lookup';

(global as any).alertList = null;
const scheduler = async () => {
  try {
    logger.info(`databaseUpdated status is ${(global as any).databaseUpdated}`);
    if ((global as any).databaseUpdated) {
      // Retrieve all alerts from the database
      (global as any).alertList = await Alert.find();
      (global as any).databaseUpdated = false;
    }
    // Perform actions on the retrieved alerts
    for (const alert of (global as any).alertList) {
      await fetchProperties(alert);
    }

    // Your additional logic here
  } catch (error) {
    logger.error('Error occurred while retrieving alerts:', error);
  }
};

// Define the cron schedule
const cronSchedule = '*/5 * * * *'; // Run the task 5 minute

// Create the cron job
const cronJob = cron.schedule(cronSchedule, scheduler);

export default cronJob;
