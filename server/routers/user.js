import * as express from "express";
import * as userController from "../controllers/user.js";
import { query, body, param, check } from "express-validator";
import { isAuthenticated } from "../middlewares/check_auth_user.js";

const router = express.Router();

router.post(
  "/dm/:offset",
  [
    isAuthenticated,
    body("receiverId").notEmpty().isNumeric(),
    param("offset").notEmpty().isNumeric(),
  ],
  userController.getDmData
);

router.get(
  "/dm/pinned-messages/:receiverId",
  [isAuthenticated, param("receiverId").notEmpty().isNumeric()],
  userController.getPinnedMessages
);

export default router;
