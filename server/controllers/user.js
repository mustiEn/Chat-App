import express from "express";
import { logger, lastDisconnect } from "../utils/index.js";
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

export const getInitalDmData = async (req, res, next) => {
  try {
    const result = validationResult(req);
    const userId = req.session.passport.user;
    const userLastDisconnect = lastDisconnect.get(userId);
    let dms;
    let receiver = {};

    if (!result.isEmpty()) {
      logger.log(result.array());
      throw new Error("Validation failed");
    }

    const { receiverId, offset } = matchedData(req);
    const limit = 30;
    // logger.log("offset", offset);

    receiver = await User.findByPk(receiverId);

    if (!receiver) throw new Error("Receiver not found");

    const since = userLastDisconnect
      ? `AND dm.createdAt <= "${userLastDisconnect}"`
      : "";
    // logger.log("SINCE,", since);

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
        replied_msg.message reply_to_msg_message, 
        replied_msg_sender.display_name reply_to_msg_sender,
				replied_msg_sender.profile reply_to_msg_profile
      FROM 
        direct_messages dm 
        INNER JOIN users sender 
          ON sender.id = dm.from_id          
        LEFT JOIN direct_messages replied_msg 
          ON dm.reply_to_msg = replied_msg.id 
        LEFT JOIN users replied_msg_sender 
          ON replied_msg.from_id = replied_msg_sender.id 
      WHERE 
        (
          (
            dm.to_id = :userId 
            AND dm.from_id = :receiverId
          ) 
          OR
          (
            dm.to_id = :receiverId
            AND dm.from_id = :userId 
          )
        )
         
      ORDER BY 
        dm.createdAt DESC
      LIMIT 
        ${limit}
    `;

    dms = await sequelize.query(dmsSql, {
      type: QueryTypes.SELECT,
      replacements: {
        userId,
        receiverId,
      },
    });
    dms = dms.reverse();
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
    // logger.log(dms.length);
    const nextId = dms[0]?.id ?? null;

    res.status(200).json({ dms, receiver, nextId });
  } catch (error) {
    next(error);
  }
};
export const getDmData = async (req, res, next) => {
  try {
    const result = validationResult(req);
    const userId = req.session.passport.user;
    let dms;
    let receiver = {};

    if (!result.isEmpty()) {
      logger.log(result.array());
      throw new Error("Validation failed");
    }

    let { receiverId, nextId } = matchedData(req);
    const limit = 30;
    logger.log("offset", nextId);

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
        replied_msg.message reply_to_msg_message, 
        replied_msg_sender.display_name reply_to_msg_sender,
				replied_msg_sender.profile reply_to_msg_profile
      FROM 
        direct_messages dm 
        INNER JOIN users sender 
          ON sender.id = dm.from_id          
        LEFT JOIN direct_messages replied_msg 
          ON dm.reply_to_msg = replied_msg.id 
        LEFT JOIN users replied_msg_sender 
          ON replied_msg.from_id = replied_msg_sender.id 
      WHERE 
        (
          (
            dm.to_id = :userId 
            AND dm.from_id = :receiverId
          ) 
          OR
          (
            dm.to_id = :receiverId
            AND dm.from_id = :userId 
          )
        )
        AND
          dm.id < :nextId  
      ORDER BY 
        dm.createdAt DESC
      LIMIT :limit
    `;

    dms = await sequelize.query(dmsSql, {
      type: QueryTypes.SELECT,
      replacements: {
        userId,
        receiverId,
        nextId,
        limit,
      },
    });
    dms = dms.reverse();

    nextId = dms.length < 30 ? null : dms[0].id;
    logger.log(nextId);

    res.status(200).json({ dms, nextId });
  } catch (error) {
    next(error);
  }
};
export const getDmHistory = async (req, res, next) => {
  try {
    const userId = req.session.passport.user;
    const dmHistorySql = `
      SELECT 
        u.id, 
        u.display_name, 
        u.profile, 
        dmh.createdAt created_at 
      FROM 
        direct_message_history dmh 
        INNER JOIN users u ON dm_history_user_id = u.id 
      WHERE 
        user_id = :userId
    `;
    const dmHistory = await sequelize.query(dmHistorySql, {
      type: QueryTypes.SELECT,
      replacements: { userId },
    });
    res.status(200).json({ dmHistoryResult: dmHistory });
  } catch (error) {
    next(error);
  }
};

export const getPinnedMessages = async (req, res, next) => {
  try {
    const result = validationResult(req);
    const userId = req.session.passport.user;

    if (!result.isEmpty()) {
      logger.log(result.array());
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
        LEFT JOIN direct_messages dms ON dm.reply_to_msg = dms.id 
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
      logger.log(result.array());
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
