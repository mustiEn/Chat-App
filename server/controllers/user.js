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
    let pinnedMessages = [];

    if (!result.isEmpty()) {
      console.log(result.array());
      throw new Error("Validation failed");
    }

    const { receiverId, offset, firstMsgId, pinnedMsgId, msgsLength } =
      matchedData(req);
    const receiver = await User.findOne({
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

    if (!receiver) {
      throw new Error("User not found");
    }

    if (firstMsgId) {
      const firstMsg = await DirectMessage.findByPk(firstMsgId);
      const pinnedMsg = await DirectMessage.findByPk(pinnedMsgId);
      const offset = msgsLength;
      console.log(firstMsg.toJSON().createdAt);

      console.log(formatDate(firstMsg.toJSON().createdAt));

      if (!firstMsg) throw new Error("Message not found");
      if (!pinnedMsg) throw new Error("Pinned message not found");

      const rowNumSql = `
        SELECT 
          COUNT(*) AS row_num 
          FROM 
            (
              SELECT 
                * 
              FROM 
                direct_messages dm 
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
                dm.createdAt
            ) t 
          WHERE 
            t.id > :pinnedMsgId 
            AND 
            t.id < :firstMsgId
      `;
      const [{ row_num: rowNum }] = await sequelize.query(rowNumSql, {
        type: QueryTypes.SELECT,
        replacements: {
          userId,
          receiverId,
          pinnedMsgId: pinnedMsgId,
          firstMsgId: firstMsgId,
        },
      });
      console.log(rowNum);

      const limit = rowNum + 10;
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
            dm.to_id = ${userId} 
            AND dm.from_id = ${receiverId}
          ) 
          OR
          (
            dm.to_id = ${receiverId}
            AND dm.from_id = ${userId} 
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
      });
    } else {
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
            dm.to_id = ${userId} 
            AND dm.from_id = ${receiverId}
          ) 
          OR
          (
            dm.to_id = ${receiverId}
            AND dm.from_id = ${userId} 
          ) 
        ORDER BY 
          dm.createdAt DESC
        LIMIT 
          10
        OFFSET 
          ${offset}
      `;

      dms = await sequelize.query(dmsSql, {
        type: QueryTypes.SELECT,
      });
    }
    if (offset == 0) {
      pinnedMessages = dms.filter((m) => m.is_pinned);
    }

    res.status(200).json({ dms, receiver, pinnedMessages });
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
        dm.createdAt created_at
      FROM 
        direct_messages dm 
        INNER JOIN users sender ON sender.id = dm.from_id 
        INNER JOIN users receiver ON receiver.id = dm.to_id 
        LEFT JOIN direct_messages dms ON dm.reply_to_msg_id = dms.id 
      WHERE 
        (
          dm.to_id = ${userId} 
          AND dm.from_id = ${receiverId}
        ) 
        OR
        (
          dm.to_id = ${receiverId}
          AND dm.from_id = ${userId} 
        ) 
        AND dm.is_pinned = true
      ORDER BY 
        dm.createdAt DESC
    `;
    const pinnedMessages = await sequelize.query(pinnedMessagesSql, {
      type: QueryTypes.SELECT,
    });

    res.status(200).json(pinnedMessages);
  } catch (error) {
    next(error);
  }
};

export const unpinMessage = async (req, res, next) => {
  try {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      console.log(result.array());
      throw new Error("Validation failed");
    }

    const { pinnedMsgId } = matchedData(req);
    await DirectMessage.update(
      { is_pinned: false },
      {
        where: {
          id: pinnedMsgId,
        },
      }
    );
    res.status(200).json({ status: "Message unpinned" });
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
