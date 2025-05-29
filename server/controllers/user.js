import express from "express";
import { logger } from "../utils/constants.js";
import { validationResult, matchedData } from "express-validator";
import { User } from "../models/Users.js";
import { Op, QueryTypes } from "sequelize";
import { Message } from "../models/Messages.js";
import moment from "moment";
import { sequelize } from "../models/db.js";

const chats = async (req, res, next) => {
  try {
    res.status(200).json({ sdf: "dsf" });
  } catch (error) {
    next(error);
  }
};

const exploreUsers = async (req, res, next) => {
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

const getChatHistory = async (req, res, next) => {
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

const getGroup = async (req, res, next) => {
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

export { chats, exploreUsers, getChatHistory, getGroup };
