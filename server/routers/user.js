import * as express from "express";
import * as userController from "../controllers/user.js";
import { query, body, param, check } from "express-validator";
import { isAuthenticated } from "../middlewares/check_auth_user.js";
import multer from "multer";

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
  ];
  allowedFileTypes.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Invalid file type"));
};
const upload = multer({ storage, fileFilter });
const router = express.Router();

router.get(
  "/dm/initial-dm-data/:chatId",
  [isAuthenticated, param("chatId").notEmpty().isString()],
  userController.getInitialDmData
);

router.get(
  "/dm/more-data/:chatId",
  [
    isAuthenticated,
    param("chatId").notEmpty().isString(),
    query("nextIdParam").notEmpty().isNumeric(),
  ],
  userController.getDirectMessages
);

router.get(
  "/dm/pinned-messages/:chatId",
  [isAuthenticated, param("chatId").notEmpty().isString()],
  userController.getDmPinnedMessages
);

router.get("/dm-history", isAuthenticated, userController.getDmHistory);

router.get(
  "/message-requests",
  isAuthenticated,
  userController.getMessageRequests
);

//* Friends

router.get(
  "/friends/get-all-friends/:offset",
  [isAuthenticated, param("offset").notEmpty().isInt()],
  userController.getAllFriends
);
router.get(
  "/friends/get-online-friends/:lastFriendId",
  [isAuthenticated, param("lastFriendId").notEmpty().isInt()],
  userController.getOnlineFriends
);
router.get(
  "/friends/get-friend-requests",
  isAuthenticated,
  userController.getFriendRequests
);
router.get(
  "/friends/search-friends/:groupId",
  [
    isAuthenticated,
    query("q").notEmpty().isLength({
      min: 1,
    }),
    param("groupId").notEmpty().isInt(),
  ],
  userController.searchFriends
);

//* Group

router.get(
  "/group/pinned-messages/:groupId",
  [isAuthenticated, param("groupId").notEmpty().isString()],
  userController.getGroupPinnedMessages
);
router.post(
  "/group/add-group",
  [
    isAuthenticated,
    upload.single("icon"),
    body("name").notEmpty().isLength({ min: 2, max: 75 }),
  ],
  userController.addGroup
);
router.get("/group/get-groups", isAuthenticated, userController.getGroups);
router.get(
  "/group/more-data/:groupId",
  [
    isAuthenticated,
    param("groupId").notEmpty().isString(),
    query("nextIdParam").notEmpty().isNumeric(),
  ],
  userController.getGroupMessages
);
router.get(
  "/group/get-members/:groupId",
  [isAuthenticated, param("groupId").notEmpty().isString()],
  userController.getGroupMembers
);
export default router;
