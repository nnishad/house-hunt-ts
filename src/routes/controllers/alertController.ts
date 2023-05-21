import express from 'express';
import Alert from '../../models/alert';
import logger from '../../custom-logger';
import { Mutex } from 'async-mutex';

// Define the global flag variable
(global as any).databaseUpdated = true;
// Initialize the mutex
const mutex = new Mutex();
export const alertRouter = express.Router();

/* GET Alert listing. */
/**
 * @swagger
 * /alert/searchAll:
 *   get:
 *     summary: Get all alerts
 *     description: Endpoint to retrieve all alerts.
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Alert'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
alertRouter.get('/searchAll', async function (req, res, next) {
  try {
    const allAlert = await Alert.find();
    res.json(allAlert);
  } catch (error) {
    logger.error('Error fetching all Alert', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Read a Alert by ID
/**
 * @swagger
 * /alert/search:
 *   get:
 *     summary: Search alerts by email
 *     description: Endpoint to search alerts based on the provided email.
 *     parameters:
 *       - in: body
 *         name: email
 *         description: Email to search alerts for
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Alert'
 *       404:
 *         description: Email not found in any alert
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
alertRouter.get('/search', async (req, res, next) => {
  const { email } = req.body;

  try {
    const alertList = await Alert.find({
      taggedUsers: email,
    });

    if (alertList.length === 0) {
      return res.status(404).json({ error: 'Email not found in any alert' });
    }

    const cleanedalertList = alertList.map((criteria) => {
      const { taggedUsers, _id, __v, ...cleanedCriteria } = criteria.toObject();
      return cleanedCriteria;
    });

    res.json(cleanedalertList);
  } catch (error) {
    logger.error('Error occurred:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a Alert
/**
 * @swagger
 * /alert/add:
 *   post:
 *     summary: Add or update search criteria
 *     description: Endpoint to add or update search criteria based on the provided parameters.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               locationIdentifier:
 *                 type: string
 *               radius:
 *                 type: number
 *               maxPrice:
 *                 type: number
 *               minBedrooms:
 *                 type: number
 *               letFurnishType:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
alertRouter.post('/add', async (req, res) => {
  const {
    locationIdentifier,
    radius,
    maxPrice,
    minBedrooms,
    letFurnishType,
    email,
  } = req.body;

  try {
    // Find matching criteria
    let criteria = await Alert.findOne({
      locationIdentifier,
      radius,
      maxPrice,
      minBedrooms,
      letFurnishType,
    });

    if (criteria) {
      // Check if email already exists in taggedUsers
      if (!criteria.taggedUsers.includes(email)) {
        // Add email to taggedUsers
        criteria.taggedUsers.push(email);
      } else {
        return res.json({
          message: 'Email already exists for these property details',
        });
      }
    } else {
      // Create new criteria
      criteria = new Alert({
        locationIdentifier,
        radius,
        maxPrice,
        minBedrooms,
        letFurnishType,
        taggedUsers: [email],
      });
    }
    // Acquire the lock before updating the database
    const release = await mutex.acquire();
    try {
      // Save the criteria
      await criteria.save();
      // Set the flag to indicate that the database has been updated
      (global as any).databaseUpdated = true;
      res.json({ message: 'Search criteria updated or created successfully' });
    } finally {
      // Release the lock after updating the database
      release();
    }
  } catch (error) {
    logger.error('Error occurred:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a Alert
/**
 * @swagger
 * /alert/removeOne:
 *   delete:
 *     summary: Remove email from taggedUsers list
 *     description: Endpoint to remove an email from the taggedUsers list based on the provided property details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               locationIdentifier:
 *                 type: string
 *               radius:
 *                 type: number
 *               maxPrice:
 *                 type: number
 *               minBedrooms:
 *                 type: number
 *               letFurnishType:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Alert not found for given property details or email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
alertRouter.delete('/removeOne', async (req, res, next) => {
  const {
    locationIdentifier,
    radius,
    maxPrice,
    minBedrooms,
    letFurnishType,
    email,
  } = req.body;

  try {
    // Find matching criteria
    const criteria = await Alert.findOne({
      locationIdentifier,
      radius,
      maxPrice,
      minBedrooms,
      letFurnishType,
    });

    if (!criteria) {
      return res
        .status(404)
        .json({ error: 'Alert not found for given property details' });
    }
    if (!criteria.taggedUsers.includes(email)) {
      return res.status(404).json({ error: 'Alert not found for this email' });
    }

    // Remove email from taggedUsers list
    if (criteria.taggedUsers && criteria.taggedUsers.includes(email)) {
      criteria.taggedUsers = criteria.taggedUsers.filter(
        (user) => user !== email,
      );
    }

    // Acquire the lock before updating the database
    const release = await mutex.acquire();
    try {
      // Save the criteria
      await criteria.save();
      // Set the flag to indicate that the database has been updated
      (global as any).databaseUpdated = true;
      res.json({ message: `Email '${email}' removed from taggedUsers list` });
    } finally {
      // Release the lock after updating the database
      release();
    }
  } catch (error) {
    logger.error('Error occurred:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /alert/removeAll:
 *   delete:
 *     summary: Remove email from taggedUsers list for all criteria
 *     description: Endpoint to remove an email from the taggedUsers list for all criteria.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Email not found in any criteria
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
alertRouter.delete('/removeAll', async (req, res) => {
  const { email } = req.body;

  try {
    // Find matching criteria
    const alertList = await Alert.find({ taggedUsers: email });

    if (alertList.length === 0) {
      return res.status(404).json({ error: 'Email not found in any criteria' });
    }

    // Acquire the lock before updating the database
    const release = await mutex.acquire();
    try {
      // Update each criteria document
      await Promise.all(
        alertList.map(async (criteria) => {
          criteria.taggedUsers = criteria.taggedUsers.filter(
            (user) => user !== email,
          );
          await criteria.save();
        }),
      );
      // Set the flag to indicate that the database has been updated
      (global as any).databaseUpdated = true;
      res.json({
        message: `Email '${email}' removed from taggedUsers list for all criteria`,
      });
    } finally {
      // Release the lock after updating the database
      release();
    }
  } catch (error) {
    logger.error('Error occurred:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a Alert
alertRouter.put('/:id', async (req, res, next) => {
  try {
    const alertId = req.params.id;
    const {
      locationIdentifier,
      radius,
      maxPrice,
      minBedrooms,
      letFurnishType,
    } = req.body;
    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({ error: 'alert not found' });
    }
    alert.locationIdentifier = locationIdentifier;
    alert.radius = radius;
    alert.maxPrice = maxPrice;
    alert.minBedrooms = minBedrooms;
    alert.letFurnishType = letFurnishType;
    const updatedAlert = await alert.save();
    res.json(updatedAlert);
  } catch (error) {
    logger.error('Error occurred:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});
