import express from "express";
import { fetchProperties } from "../rightmove/property-lookup";

export const userRoutes = express.Router();

/* GET users listing. */
userRoutes.get('/', function (req, res, next) {
  fetchProperties();
  res.send('respond with a resource');
});
