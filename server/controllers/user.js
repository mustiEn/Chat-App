import express from "express";
import { logger } from "../utils/index.js";
import { validationResult, matchedData } from "express-validator";
import { User } from "../models/User.js";
import { Op, QueryTypes } from "sequelize";
import { sequelize } from "../models/db.js";
import { DirectMessage } from "../models/DirectMessage.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getDmData = async (req, res, next) => {
  try {
    const result = validationResult(req);
    const userId = req.session.passport.user;
    const formatDate = (date) => {
      const input = dayjs.utc(date).local();
      const format = input.format("YYYY-MM-DD HH:mm:ss");
      return format;
    };
    let dms;
    let receiver = {};

    if (!result.isEmpty()) {
      console.log(result.array());
      throw new Error("Validation failed");
    }

    const { receiverId, offset } = matchedData(req);
    const limit = 10;
    logger.log("offset", offset);

    receiver = await User.findByPk(receiverId);

    if (!receiver) throw new Error("Receiver not found");

    const dmsSql = `
      SELECT 
        dm.id,
        dm.from_id from_id, 
        sender.display_name, 
        sender.username, 
        sender.profile,
        dm.clientOffset, 
        dm.message,
        dm.is_edited,
        dm.is_pinned, 
        dm.createdAt created_at, 
        dms.message reply_to_msg 
      FROM 
        direct_messages dm 
        INNER JOIN users sender ON sender.id = dm.from_id 
        INNER JOIN users receiver ON receiver.id = dm.to_id 
        LEFT JOIN direct_messages dms ON dm.reply_to_msg_id = dms.id 
      WHERE 
        (
          dm.to_id = :userId 
          AND dm.from_id = :receiverId
        ) 
        OR
        (
          dm.to_id = :receiverId
          AND dm.from_id = :userId 
        ) 
      ORDER BY 
        dm.createdAt DESC
      LIMIT 
        ${limit}
      OFFSET 
        ${offset}
    `;

    dms = await sequelize.query(dmsSql, {
      type: QueryTypes.SELECT,
      replacements: {
        userId,
        receiverId,
      },
    });

    if (offset && offset == 0) {
      receiver = await User.findOne({
        attributes: [
          "id",
          "display_name",
          "username",
          "profile",
          "background_color",
          "about_me",
          "createdAt",
        ],
        where: { id: receiverId },
      });
    }

    res.status(200).json({ dms, receiver });
  } catch (error) {
    next(error);
  }
};

export const getPinnedMessages = async (req, res, next) => {
  try {
    const result = validationResult(req);
    const userId = req.session.passport.user;

    if (!result.isEmpty()) {
      console.log(result.array());
      throw new Error("Validation failed");
    }

    const { receiverId } = matchedData(req);
    const receiver = await User.findByPk(receiverId);

    if (!receiver) {
      throw new Error("User not found");
    }

    const pinnedMessagesSql = `
      SELECT 
        dm.id,
        sender.display_name, 
        sender.username, 
        sender.profile,
        dm.clientOffset, 
        dm.message,
        dm.createdAt created_at,
        dm.pin_updated_at
      FROM 
        direct_messages dm 
        INNER JOIN users sender ON sender.id = dm.from_id 
        INNER JOIN users receiver ON receiver.id = dm.to_id 
        LEFT JOIN direct_messages dms ON dm.reply_to_msg_id = dms.id 
      WHERE 
        ((
          dm.to_id = ${userId} 
          AND dm.from_id = ${receiverId}
        ) 
        OR
        (
          dm.to_id = ${receiverId}
          AND dm.from_id = ${userId} 
        )) 
        AND dm.is_pinned = 1
      ORDER BY 
        dm.pin_updated_at DESC
    `;
    const pinnedMessages = await sequelize.query(pinnedMessagesSql, {
      type: QueryTypes.SELECT,
    });
    const sortedPinnedMessages = pinnedMessages.sort((a, b) => {
      const dateA = new Date(a.pin_updated_at);
      const dateB = new Date(b.pin_updated_at);
      return dateB - dateA;
    });

    res.status(200).json(sortedPinnedMessages);
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
