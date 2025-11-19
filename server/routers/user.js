import * as express from "express";
import * as userController from "../controllers/user.js";
import { query, body, param, check } from "express-validator";
import { isAuthenticated } from "../middlewares/check_auth_user.js";

const router = express.Router();

router.get(
  "/dm/initialChatData/:chatId",
  [isAuthenticated, param("chatId").notEmpty().isString()],
  userController.getInitialDmData
);

router.get(
  "/dm/moreData/:chatId",
  [
    isAuthenticated,
    param("chatId").notEmpty().isString(),
    query("nextId").notEmpty().isNumeric(),
  ],
  userController.getDmData
);

router.get(
  "/dm/pinned-messages/:chatId",
  [isAuthenticated, param("chatId").notEmpty().isString()],
  userController.getPinnedMessages
);

router.get("/dmHistory", isAuthenticated, userController.getDmHistory);

router.get(
  "/message-requests",
  isAuthenticated,
  userController.getMessageRequests
);
router.get(
  "/get-all-friends/:offset",
  [isAuthenticated, param("offset").notEmpty().isInt()],
  userController.getAllFriends
);
router.get(
  "/get-online-friends/:lastFriendId",
  [isAuthenticated, param("lastFriendId").notEmpty().isInt()],
  userController.getOnlineFriends
);
router.get(
  "/get-friend-requests",
  isAuthenticated,
  userController.getFriendRequests
);

export default router;
