import express from "express";
import { logger, lastDisconnect } from "../utils/index.js";
import { validationResult, matchedData } from "express-validator";
import { User } from "../models/User.js";
import { DataTypes, Op, QueryTypes } from "sequelize";
import { sequelize } from "../models/db.js";
import { DirectMessage } from "../models/DirectMessage.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getInitialDmData = async (req, res, next) => {
  try {
    const result = validationResult(req);
    const userId = req.session.passport.user;
    let dms;
    let receiver = {};

    if (!result.isEmpty()) {
      logger.log(result.array());
      throw new Error("Validation failed");
    }

    const { receiverId, offset } = matchedData(req);
    const limit = 30;

    receiver = (
      await User.findByPk(receiverId, {
        attributes: [
          "id",
          "display_name",
          "username",
          "profile",
          "background_color",
          "about_me",
          "createdAt",
        ],
      })
    ).toJSON();

    if (!receiver) throw new Error("Receiver not found");

    //* do who blocked who

    const isReceiverBlockedSql = `
      SELECT 
        1 
      FROM 
        blocked_users 
      WHERE 
        blocked_by_id = :userId 
        AND
        blocked_id = :receiverId
    `;
    const isFriendSql = `
      SELECT 
        COUNT(*) val 
      FROM 
        friends 
      WHERE
        (
          user_id = :userId 
          AND
          friend_id = :receiverId
        ) 
        OR
        (
          user_id = :receiverId 
          AND
          friend_id = :userId
        )
    `;
    const hasChatHistorySql = `
      SELECT 
        COUNT(*) val 
      FROM 
        direct_messages 
      WHERE 
        (
          to_id = :userId 
          AND from_id = :receiverId
        ) 
        OR 
        (
          to_id = :receiverId 
          AND from_id = :userId
        )
    `;
    const dmsSql = ` 
      SELECT 
        dm.id,
        dm.from_id,
        dm.to_id, 
        sender.display_name, 
        sender.username, 
        sender.profile,
        dm.clientOffset, 
        dm.message,
        dm.is_edited,
        dm.is_pinned,
        dm.request_state, 
        dm.createdAt created_at, 
        replied_msg.id replied_msg_id,
        replied_msg.message replied_msg_message,
        replied_msg.is_deleted is_replied_msg_deleted, 
        replied_msg_sender.display_name replied_msg_sender,
				replied_msg_sender.profile replied_msg_profile
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
        dm.is_deleted = 0
         
      ORDER BY 
        dm.createdAt DESC
      LIMIT 
        ${limit}
    `;
    const [isReceiverBlocked] = await sequelize.query(isReceiverBlockedSql, {
      type: QueryTypes.SELECT,
      replacements: {
        userId,
        receiverId,
      },
    });

    if (isReceiverBlocked) {
      receiver["is_blocked"] = true;
    } else {
      const [isFriend] = await sequelize.query(isFriendSql, {
        type: QueryTypes.SELECT,
        replacements: {
          userId,
          receiverId,
        },
      });
      const [hasChatHistory] = await sequelize.query(hasChatHistorySql, {
        type: QueryTypes.SELECT,
        replacements: {
          userId,
          receiverId,
        },
      });
      logger.log(hasChatHistory, isFriend);

      if (!hasChatHistory.val && !isFriend.val) {
        receiver["with_in_no_contact"] = true;
      }
    }

    dms = await sequelize.query(dmsSql, {
      type: QueryTypes.SELECT,
      replacements: {
        userId,
        receiverId,
      },
    });
    dms = dms.reverse();
    logger.log(receiver);
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
        replied_msg.id replied_msg_id, 
        replied_msg.message replied_msg_message,
        replied_msg.is_deleted is_replied_msg_deleted, 
        replied_msg_sender.display_name replied_msg_sender,
				replied_msg_sender.profile replied_msg_profile
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
      ORDER BY 
        dmh.createdAt DESC
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
        dm.to_id,
        dm.is_pinned,
        dm.last_pin_action_by_id,
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
export const getMessageRequests = async (req, res, next) => {
  try {
    const userId = req.session.passport.user;
    const receivedMessageRequests = `
      SELECT 
        dm.id, 
        sender.id from_id,
        sender.display_name, 
        sender.username, 
        sender.profile, 
        dm.to_id,
        dm.clientOffset, 
        dm.message, 
        dm.request_state, 
        dm.createdAt created_at 
      FROM 
        direct_messages dm 
        INNER JOIN users sender ON sender.id = dm.from_id 
      WHERE 
        dm.request_state = "pending" 
        AND dm.is_deleted = 0 
        AND dm.to_id = :userId
    `;
    const messageRequests = await sequelize.query(receivedMessageRequests, {
      type: QueryTypes.SELECT,
      replacements: {
        userId,
      },
    });

    res.status(200).json(messageRequests);
  } catch (error) {
    next(error);
  }
};
export const getMessageRequested = async (req, res, next) => {
  try {
    const userId = req.session.passport.user;
    const messageRequestsSql = `
      SELECT 
        dm.id,
        sender.id, 
        sender.display_name, 
        sender.username, 
        sender.profile, 
        dm.clientOffset, 
        dm.message, 
        dm.request_state, 
        dm.createdAt created_at 
      FROM 
        direct_messages dm 
        INNER JOIN users sender ON sender.id = dm.from_id 
      WHERE 
        dm.request_state = 1 
        AND dm.is_deleted = 0 
        AND dm.to_id = :userId
    `;
    const messageRequests = await sequelize.query(messageRequestsSql, {
      type: QueryTypes.SELECT,
      replacements: {
        userId,
      },
    });

    res.status(200).json(messageRequests);
  } catch (error) {
    next(error);
  }
};
export const getAllFriends = async (req, res, next) => {
  try {
    const userId = req.session.passport.user;
    const result = validationResult(req);
    const limit = 15;

    if (!result.isEmpty()) {
      logger.log(result);
      throw new Error("Validation error");
    }

    const { offset } = matchedData(req);
    const friendsSql = `
      SELECT 
        u.id, 
        u.username, 
        u.display_name, 
        u.profile 
      FROM 
        friends f 
        INNER JOIN users u ON u.id = f.friend_id 
      WHERE 
        (
          f.user_id = :userId 
          OR 
          f.friend_id = :userId
        ) 
        AND f.request_state = "accepted" 
      ORDER BY 
        u.display_name ASC 
      LIMIT :limit 
      OFFSET :offset
    `;
    const friends = await sequelize.query(friendsSql, {
      type: QueryTypes.SELECT,
      replacements: {
        userId,
        limit,
        offset: Number(offset),
      },
    });
    const next =
      friends.length < limit ? undefined : friends.length + Number(offset);

    res.status(200).json({ friends, next });
  } catch (error) {
    next(error);
  }
};
export const getOnlineFriends = async (req, res, next) => {
  try {
    const userId = req.session.passport.user;
    const limit = 15;
    //? REDIS ONLINE FRIENDS
    // const next =
    //   friends.length < limit ? undefined : friends.length + Number(offset);

    res.status(200).json({ friends: [], next: 1 });
  } catch (error) {
    next(error);
  }
};
export const getFriendRequests = async (req, res, next) => {
  try {
    const userId = req.session.passport.user;
    const receivedFriendRequestsSql = `
      SELECT 
        u.id, 
        u.username, 
        u.display_name, 
        u.profile,
        u.status 
      FROM 
        friends f
        INNER JOIN users u ON u.id = f.user_id
        WHERE f.friend_id = :userId
        AND request_state = "pending"
    `;
    const sentFriendRequestsSql = `
      SELECT 
        u.id, 
        u.username, 
        u.display_name, 
        u.profile,
        u.status 
      FROM 
        friends f
        INNER JOIN users u ON u.id = f.friend_id
        WHERE f.user_id = :userId
        AND request_state = "pending"
    `;
    const [receivedFriendRequests, sentFriendRequests] = await Promise.all([
      sequelize.query(receivedFriendRequestsSql, {
        type: QueryTypes.SELECT,
        replacements: {
          userId,
        },
      }),
      sequelize.query(sentFriendRequestsSql, {
        type: QueryTypes.SELECT,
        replacements: {
          userId,
        },
      }),
    ]);

    res.status(200).json({ receivedFriendRequests, sentFriendRequests });
  } catch (error) {
    next(error);
  }
};
