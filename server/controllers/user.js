import express from "express";
import { logger } from "../utils/index.js";
import { validationResult, matchedData } from "express-validator";
import { User } from "../models/User.js";
import { fn, Op, QueryTypes } from "sequelize";
import { sequelize } from "../models/db.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { ChatId } from "../models/ChatId.js";
import { Friend } from "../models/Friend.js";
import { BlockedUser } from "../models/BlockedUser.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getInitialDmData = async (req, res, next) => {
  try {
    const result = validationResult(req);
    const userId = req.session.passport.user;

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
    let receiver = {};
    let friendStatus = null;

    if (!result.isEmpty()) {
      logger.log(result.array());
      throw new Error("Validation failed");
    }

    const { chatId } = matchedData(req);
    const chat = await ChatId.findOne({
      attributes: ["user_id", "receiver_id"],
      where: {
        chat_id: chatId,
      },
      raw: true,
    });

    if (!chat) throw new Error("Chat not found");

    const { user_id, receiver_id } = chat;
    const receiverId = user_id == userId ? receiver_id : user_id;
    const isReceiverBlocked = await BlockedUser.findOne({
      where: {
        [Op.or]: [
          { blocked_by_id: userId, blocked_id: receiverId },
          { blocked_by_id: receiverId, blocked_id: userId },
        ],
      },
    });

    receiver = await User.findByPk(receiverId, {
      attributes: [
        "id",
        "display_name",
        "username",
        "profile",
        "background_color",
        "about_me",
        "createdAt",
      ],
      raw: true,
    });

    if (!receiver) throw new Error("Receiver not found");

    //* do who blocked who

    if (isReceiverBlocked) {
      receiver["isBlocked"] = true;
      receiver["blockedBy"] =
        isReceiverBlocked.blocked_by_id == userId ? "me" : "receiver";
    } else {
      friendStatus = await Friend.findOne({
        where: {
          [Op.or]: [
            {
              user_id: userId,
              friend_id: receiverId,
            },
            {
              user_id: receiverId,
              friend_id: userId,
            },
          ],
        },
        raw: true,
      });
      const [hasChatHistory] = await sequelize.query(hasChatHistorySql, {
        type: QueryTypes.SELECT,
        replacements: {
          userId,
          receiverId,
        },
      });

      if (
        // !hasChatHistory.val
        1 &&
        !friendStatus
      ) {
        receiver["with_in_no_contact"] = true;
      }
    }
    logger.log("friendStatus", friendStatus);
    res.status(200).json({ receiver, friendStatus });
  } catch (error) {
    next(error);
  }
};
export const getDmData = async (req, res, next) => {
  try {
    const result = validationResult(req);
    const userId = req.session.passport.user;
    const nextIdSql = "AND dm.id < :nextId";
    const limit = 30;
    let replacements = {
      userId,
      limit,
    };
    let dms;
    let receiver = {};

    if (!result.isEmpty()) {
      logger.log(result.array());
      throw new Error("Validation failed");
    }

    let { chatId, nextId } = matchedData(req);
    const chat = await ChatId.findOne({
      attributes: ["user_id", "receiver_id"],
      where: {
        chat_id: chatId,
      },
      raw: true,
    });

    if (!chat) throw new Error("Chat not found");

    const { user_id, receiver_id } = chat;
    const receiverId = user_id == userId ? receiver_id : user_id;

    nextId = Number(nextId);
    receiver = await User.findByPk(receiverId, {
      attributes: [
        "id",
        "display_name",
        "username",
        "profile",
        "background_color",
        "about_me",
        "createdAt",
      ],
      raw: true,
    });

    if (!receiver) throw new Error("Receiver not found");

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
        ${nextId !== 0 ? nextIdSql : ""}
      ORDER BY 
        dm.createdAt DESC
      LIMIT 
        :limit
    `;

    replacements = nextId
      ? { ...replacements, receiverId, nextId }
      : { ...replacements, receiverId };
    receiver = await User.findByPk(receiverId);

    if (!receiver) throw new Error("Receiver not found");

    dms = await sequelize.query(dmsSql, {
      type: QueryTypes.SELECT,
      replacements,
    });
    dms = dms.reverse();
    nextId = dms.length < 30 ? null : dms[0].id;

    res.status(200).json({ messages: dms, nextId });
  } catch (error) {
    next(error);
  }
};
export const getDmHistory = async (req, res, next) => {
  try {
    const userId = req.session.passport.user;
    const dmHistorySql = `
      SELECT 
          * 
        FROM 
          (
            SELECT 
              u.id, 
              u.display_name, 
              u.profile, 
              c.chat_id chatId, 
              dmh.createdAt created_at 
            FROM 
              direct_message_history dmh 
              INNER JOIN users u ON dm_history_user_id = u.id 
              INNER JOIN chat_ids c ON c.receiver_id = u.id 
              AND c.user_id = :userId 
            WHERE 
              dmh.user_id = :userId 
            UNION 
            SELECT 
              u.id, 
              u.display_name, 
              u.profile, 
              c.chat_id, 
              dmh.createdAt created_at 
            FROM 
              direct_message_history dmh 
              INNER JOIN users u ON dm_history_user_id = u.id 
              INNER JOIN chat_ids c ON c.user_id = u.id 
              AND c.receiver_id = :userId 
            WHERE 
              dmh.user_id = :userId
          ) AS t 
        ORDER BY 
          t.created_at DESC
    `;
    const dmHistory = await sequelize.query(dmHistorySql, {
      type: QueryTypes.SELECT,
      replacements: { userId },
    });

    res.status(200).json(dmHistory);
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

    const { chatId } = matchedData(req);
    const chat = await ChatId.findOne({
      attributes: ["user_id", "receiver_id"],
      where: {
        chat_id: chatId,
      },
      raw: true,
    });

    if (!chat) throw new Error("Chat not found");

    const { user_id, receiver_id } = chat;
    const receiverId = user_id == userId ? receiver_id : user_id;
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
          dm.to_id = :userId
          AND dm.from_id = :receiverId
        ) 
        OR
        (
          dm.to_id = :receiverId
          AND dm.from_id = :userId
        )) 
        AND dm.is_pinned = 1
      ORDER BY 
        dm.pin_updated_at DESC
    `;
    const pinnedMessages = await sequelize.query(pinnedMessagesSql, {
      type: QueryTypes.SELECT,
      replacements: {
        userId,
        receiverId,
      },
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
    const receivedMessageRequestsSql = `
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
    const sentMessageRequestsSql = `
      SELECT  
        dm.to_id
      FROM 
        direct_messages dm 
      WHERE 
        dm.request_state = "pending" 
        AND dm.is_deleted = 0 
        AND dm.from_id = :userId
    `;
    const [receivedMessageRequests, sentMessageRequests] = await Promise.all([
      sequelize.query(receivedMessageRequestsSql, {
        type: QueryTypes.SELECT,
        replacements: {
          userId,
        },
      }),
      sequelize.query(sentMessageRequestsSql, {
        type: QueryTypes.SELECT,
        replacements: {
          userId,
        },
      }),
    ]);

    res.status(200).json({ receivedMessageRequests, sentMessageRequests });
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
        IF(f.user_id = :userId, friend_id, user_id) id, 
        u.username, 
        u.display_name, 
        u.profile 
      FROM 
        friends f 
        INNER JOIN users u ON u.id = IF(f.user_id = :userId, friend_id, user_id)
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
    let friends = await sequelize.query(friendsSql, {
      type: QueryTypes.SELECT,
      replacements: {
        userId,
        limit,
        offset: Number(offset),
      },
    });
    const ids = friends.map(({ id }) =>
      [userId, id].sort((a, b) => a - b).join("-")
    );
    const chatIds = await ChatId.findAll({
      attributes: ["chat_id", "chat_key"],
      where: {
        chat_key: {
          [Op.in]: ids,
        },
      },
      raw: true,
    });
    if (chatIds.length) {
      const findChatId = (friendId) => {
        const key = [userId, friendId].sort((a, b) => a - b).join("-");
        const chat = chatIds.find(({ chat_key }) => chat_key === key);
        return chat.chat_id;
      };

      friends = friends.map((e) => ({ ...e, chatId: findChatId(e.id) }));
    }

    const next =
      friends.length < limit ? null : friends.length + Number(offset);
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
        u.username
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
