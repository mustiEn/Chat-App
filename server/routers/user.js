import * as express from "express";
import * as userController from "../controllers/user.js";

const router = express.Router();

router.get("/get-dm-history/:userId", userController.getDmHistory);

export default router;
