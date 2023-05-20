import express from "express";
import logger from "./custom-logger";
import router from "./routes/routes";

const app = express();

app.use(router);

app.listen(3001, () => {
  logger.info('Server started on port 3001');
});
