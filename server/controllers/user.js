import express from "express";
import { logger } from "../utils/index.js";
import { validationResult, matchedData } from "express-validator";
import { User } from "../models/User.js";
import { Op, QueryTypes } from "sequelize";
import moment from "moment";
import { sequelize } from "../models/db.js";
import { DirectMessage } from "../models/DirectMessage.js";

export const getDmHistory = async (req, res, next) => {
  try {
    const { userId: receiverId } = req.params;
    const userId = req.session.passport.user;
    const dms = await DirectMessage.findAll({
      where: {
        from_id: {
          [Op.or]: [userId, receiverId],
        },
        to_id: {
          [Op.or]: [userId, receiverId],
        },
      },
      order: [["createdAt", "ASC"]],
    });
    console.log("dms ", dms.length);

    res.status(200).json({ dms, userId: userId });
  } catch (error) {
    next(error);
  }
};

export const exploreUsers = async (req, res, next) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      console.log(result.array());
      throw new Error("Validation failed");
    }
    const data = matchedData(req);
    const { explore } = data;
    const users = await User.findAll({
      where: {
        username: {
          [Op.startsWith]: explore,
        },
      },
    });

    res.status(200).json({ users: users });
  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (req, res, next) => {
  try {
    const { receiverId } = req.params;
    const authenticatedUserId = req.session.passport.user;
    logger.log("authenticatedUserId", authenticatedUserId);
    logger.log("receiverId", receiverId);
    let messages = await Message.findAll({
      where: {
        from: {
          [Op.or]: [authenticatedUserId, receiverId],
        },
        to: {
          [Op.or]: [authenticatedUserId, receiverId],
        },
      },
      order: [["createdAt", "ASC"]],
    });
    messages = messages.map((e) => {
      e = e.toJSON();
      e.createdAt = moment(e.createdAt).format("hh:mm:ss");
      return e;
    });
    // logger.log('CHAT HISTTORY ==>', messages)
    res
      .status(200)
      .json({ messages: messages, authenticatedUserId: authenticatedUserId });
  } catch (error) {
    next(error);
  }
};

export const getGroup = async (req, res, next) => {
  try {
    const sql = `SELECT * FROM group_messages`;
    const result = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });
    res.status(200).json({ result: result });
  } catch (error) {
    next(error);
  }
};
