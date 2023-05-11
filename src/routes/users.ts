import express from 'express';

export const userRoutes = express.Router();

/* GET users listing. */
userRoutes.get('/', function (req, res, next) {
  res.send('respond with a resource');
});
