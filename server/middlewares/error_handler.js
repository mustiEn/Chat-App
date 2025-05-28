import { logger } from "../utils/constants.js";

export const handleError = (err, req, res, next) => {
  logger.log("ERROR HANDLER: ", err);
  const error = err.message || "Something went wrong";
  res.status(500).json({ error: error });
};
