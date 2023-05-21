import express from 'express';
import Alert from '../../models/alert';
import logger from '../../custom-logger';

export const alertRouter = express.Router();

/* GET Alert listing. */
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
    console.error('Error occurred:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a Alert
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

    // Save the criteria
    await criteria.save();

    res.json({ message: 'Search criteria updated or created successfully' });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a Alert
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

    // Save the updated criteria
    await criteria.save();

    res.json({ message: `Email '${email}' removed from taggedUsers list` });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

alertRouter.delete('/removeAll', async (req, res) => {
  const { email } = req.body;

  try {
    // Find matching criteria
    const alertList = await Alert.find({ taggedUsers: email });

    if (alertList.length === 0) {
      return res.status(404).json({ error: 'Email not found in any criteria' });
    }

    // Update each criteria document
    await Promise.all(
      alertList.map(async (criteria) => {
        criteria.taggedUsers = criteria.taggedUsers.filter(
          (user) => user !== email,
        );
        await criteria.save();
      }),
    );

    res.json({
      message: `Email '${email}' removed from taggedUsers list for all criteria`,
    });
  } catch (error) {
    console.error('Error occurred:', error);
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
    res.status(500).json({ error: 'Failed to update alert' });
  }
});
