import * as express from "express";
import * as userController from "../controllers/user.js";
import { query, body, param, check } from "express-validator";
import { isAuthenticated } from "../middlewares/check_auth_user.js";

const router = express.Router();

router.post(
  "/dm/pinned-message-view",
  [
    isAuthenticated,
    body("receiverId").notEmpty().isNumeric(),
    body("pinnedMsgId").optional().notEmpty().isNumeric(),
    body("edgeMsgId").optional().isNumeric(),
    body("direction").isString(),
    body("msgsLength").notEmpty().isNumeric(),
  ],
  userController.getPinnedMessageView
);

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

router.post(
  "/delete-pinned-message",
  [isAuthenticated, check("pinnedMsgId").notEmpty()],
  userController.unpinMessage
);

export default router;
