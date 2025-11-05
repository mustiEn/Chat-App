import * as express from "express";
import * as userController from "../controllers/user.js";
import { query, body, param, check } from "express-validator";
import { isAuthenticated } from "../middlewares/check_auth_user.js";

const router = express.Router();

router.post(
  "/dm/initialChatData/:receiverId",
  [isAuthenticated, param("receiverId").notEmpty().isNumeric()],
  userController.getInitialDmData
);

router.post(
  "/dm/moreData/:receiverId",
  [
    isAuthenticated,
    param("receiverId").notEmpty().isNumeric(),
    query("nextId").notEmpty().isNumeric(),
  ],
  userController.getDmData
);

router.get(
  "/dm/pinned-messages/:receiverId",
  [isAuthenticated, param("receiverId").notEmpty().isNumeric()],
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
