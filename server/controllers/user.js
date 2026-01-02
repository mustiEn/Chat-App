import express from "express";
import { logger } from "../utils/index.js";
import { validationResult, matchedData } from "express-validator";
import { User } from "../models/User.js";
import { fn, Op, QueryTypes } from "sequelize";
import { sequelize } from "../models/db.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { OneToOneChat } from "../models/OneToOneChat.js";
import { Friend } from "../models/Friend.js";
import { BlockedUser } from "../models/BlockedUser.js";
import { client } from "../server.js";
import { GroupChat } from "../models/GroupChat.js";
import { GroupMember } from "../models/GroupMember.js";

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
        chat_id = :id
    `;
    let receiver = {};
    let friendStatus = null;

    if (!result.isEmpty()) {
      logger.log(result.array());
      throw new Error("Validation failed");
    }

    const { chatId } = matchedData(req);
    const chat = await OneToOneChat.findOne({
      attributes: ["id", "user_id", "receiver_id"],
      where: {
        chat_id: chatId,
      },
      raw: true,
    });

    if (!chat) throw new Error("Chat not found");

    const { id, user_id, receiver_id } = chat;
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
        "status",
      ],
      raw: true,
    });

    if (!receiver) throw new Error("Receiver not found");
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
          id,
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

    res.status(200).json({ receiver, friendStatus });
  } catch (error) {
    next(error);
  }
};
export const getDirectMessages = async (req, res, next) => {
  try {
    const result = validationResult(req);
    const userId = req.session.passport.user;
    const nextIdSql = "AND dm.id < :nextId";
    const limit = 30;
    let dms;
    let receiver = {};

    if (!result.isEmpty()) {
      logger.log(result.array());
      throw new Error("Validation failed");
    }

    const { chatId, nextIdParam } = matchedData(req);
    const chat = await OneToOneChat.findOne({
      attributes: ["id", "user_id", "receiver_id"],
      where: {
        chat_id: chatId,
      },
      raw: true,
    });

    if (!chat) throw new Error("Chat not found");

    const { id, user_id, receiver_id } = chat;
    const receiverId = user_id == userId ? receiver_id : user_id;
    const cachedStatus = await client.get(`user:${receiverId}:status`);
    const nextId = Number(nextIdParam);
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
          ON dm.reply_to_msg_id = replied_msg.id 
        LEFT JOIN users replied_msg_sender 
          ON replied_msg.from_id = replied_msg_sender.id 
      WHERE 
        dm.chat_id = :id
        AND 
        dm.is_deleted = 0
        ${nextId !== 0 ? nextIdSql : ""}
      ORDER BY 
        dm.createdAt DESC
      LIMIT 
        :limit
    `;

    receiver = await User.findByPk(receiverId, {
      attributes: [
        "id",
        "display_name",
        "username",
        "profile",
        "status",
        "background_color",
        "about_me",
        "createdAt",
      ],
      raw: true,
    });

    if (!receiver) throw new Error("Receiver not found");
    if (!cachedStatus) {
      await client.set(`user:${receiverId}:status`, receiver.status);
    } else {
      receiver.status = cachedStatus;
    }

    receiver = await User.findByPk(receiverId);

    if (!receiver) throw new Error("Receiver not found");

    dms = await sequelize.query(dmsSql, {
      type: QueryTypes.SELECT,
      replacements: { limit, id, nextId },
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
              u.status, 
              c.chat_id chatId, 
              dmh.createdAt created_at 
            FROM 
              direct_message_history dmh 
              INNER JOIN users u ON dm_history_user_id = u.id 
              INNER JOIN one_to_one_chats c ON c.receiver_id = u.id 
              AND c.user_id = :userId 
            WHERE 
              dmh.user_id = :userId 
            UNION 
            SELECT 
              u.id, 
              u.display_name, 
              u.profile,
              u.status, 
              c.chat_id, 
              dmh.createdAt created_at 
            FROM 
              direct_message_history dmh 
              INNER JOIN users u ON dm_history_user_id = u.id 
              INNER JOIN one_to_one_chats c ON c.user_id = u.id 
              AND c.receiver_id = :userId 
            WHERE 
              dmh.user_id = :userId
          ) AS t 
        ORDER BY 
          t.created_at DESC
    `;
    let dmHistory = await sequelize.query(dmHistorySql, {
      type: QueryTypes.SELECT,
      replacements: { userId },
    });

    const dmHistoryMapped = dmHistory.map(async (e) => {
      const cachedStatus = await client.get(`user:${e.id}:status`);

      if (cachedStatus) {
        return { ...e, status: cachedStatus };
      } else {
        await client.set(`user:${e.id}:status`, e.status);
        return e;
      }
    });

    dmHistory = await Promise.all(dmHistoryMapped);

    res.status(200).json(dmHistory);
  } catch (error) {
    next(error);
  }
};
export const getDmPinnedMessages = async (req, res, next) => {
  try {
    const result = validationResult(req);
    const userId = req.session.passport.user;

    if (!result.isEmpty()) {
      logger.log(result.array());
      throw new Error("Validation failed");
    }

    const { chatId } = matchedData(req);
    const chat = await OneToOneChat.findOne({
      attributes: ["id", "user_id", "receiver_id"],
      where: {
        chat_id: chatId,
      },
      raw: true,
    });

    if (!chat) throw new Error("Chat not found");

    const { id, user_id, receiver_id } = chat;
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
        LEFT JOIN direct_messages dms ON dm.reply_to_msg_id = dms.id 
      WHERE 
        dm.chat_id = :id 
        AND dm.is_pinned = 1
      ORDER BY 
        dm.pin_updated_at DESC
    `;
    const pinnedMessages = await sequelize.query(pinnedMessagesSql, {
      type: QueryTypes.SELECT,
      replacements: {
        id,
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
        u.profile,
        u.status 
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
    const chatIds = await OneToOneChat.findAll({
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
    const friendsMapped = friends.map(async (e) => {
      const cachedStatus = await client.get(`user:${e.id}:status`);

      if (cachedStatus) {
        return { ...e, status: cachedStatus };
      } else {
        await client.set(`user:${e.id}:status`, e.status);
        return e;
      }
    });

    friends = await Promise.all(friendsMapped);

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
export const addGroup = async (req, res, next) => {
  try {
    const userId = req.session.passport.user;
    // if (!req?.file) return;
    const result = validationResult(req);

    if (!result.isEmpty()) throw new Error({ message: result.array() });
    const { name } = matchedData(req);
    const group = (
      await GroupChat.create({
        group_name: name,
        created_by_id: userId,
      })
    ).toJSON();
    await GroupMember.create({
      group_id: group.id,
      user_id: userId,
    });

    res.status(200).json({ group });
  } catch (error) {
    next(error);
  }
};
export const getGroups = async (req, res, next) => {
  try {
    const userId = req.session.passport.user;

    const groupsSql = `
      SELECT 
        gc.* 
      FROM 
        group_chats gc 
        INNER JOIN (
          SELECT 
            group_id 
          FROM 
            group_members 
          WHERE 
            user_id = :userId
        ) temp ON gc.id = temp.group_id    
    `;
    const groups = await sequelize.query(groupsSql, {
      type: QueryTypes.SELECT,
      replacements: {
        userId,
      },
    });

    res.status(200).json(groups);
  } catch (error) {
    next(error);
  }
};
export const searchFriends = async (req, res, next) => {
  try {
    const userId = req.session.passport.user;
    const result = validationResult(req);

    if (!result.isEmpty()) throw new Error({ message: result.array() });

    const { q, groupId } = matchedData(req);

    const nonMemberFriendsSql = `
      WITH friends_temp AS (
        SELECT 
          friend_id AS other_user_id 
        FROM 
          friends 
        WHERE 
          user_id = :userId 
        UNION 
        SELECT 
          user_id AS other_user_id 
        FROM 
          friends 
        WHERE 
          friend_id = :userId
      ), 
      members_temp AS (
        SELECT 
          user_id id 
        FROM 
          group_members 
        WHERE 
          group_id = :groupId
      ) 

      SELECT 
        u.* 
      FROM 
        users u 
        INNER JOIN friends_temp f ON f.other_user_id = u.id 
        LEFT JOIN members_temp m ON m.id = u.id 
      WHERE 
        m.id IS NULL
        AND u.display_name LIKE :q
    `;
    const nonMemberFriends = await sequelize.query(nonMemberFriendsSql, {
      replacements: {
        userId,
        q: `%${q}%`,
        groupId,
      },
      type: QueryTypes.SELECT,
    });

    res.status(200).json({ nonMemberFriends: nonMemberFriends });
  } catch (error) {
    next(error);
  }
};
// export const getGroupMessages = async (req, res, next) => {
//   try {
//     const sql = `SELECT * FROM group_messages`;
//     const result = await sequelize.query(sql, {
//       type: QueryTypes.SELECT,
//     });
//     res.status(200).json({ result: result });
//   } catch (error) {
//     next(error);
//   }
// };
export const getGroupPinnedMessages = async (req, res, next) => {
  try {
    const result = validationResult(req);
    const userId = req.session.passport.user;

    if (!result.isEmpty()) {
      logger.log(result.array());
      throw new Error("Validation failed");
    }

    const { groupId } = matchedData(req);
    const group = await GroupChat.findOne({
      attributes: ["id"],
      where: {
        group_id: groupId,
      },
      raw: true,
    });

    if (!group) throw new Error("Group not found");

    const isMember = GroupMember.findOne({
      where: {
        user_id: userId,
        group_id: group.id,
      },
    });

    if (!isMember) throw new Error("Not a member in this group");

    const pinnedMessagesSql = `
      SELECT 
        gm.id,
        sender.display_name, 
        sender.username, 
        sender.profile,
        gm.to_id,
        gm.is_pinned,
        gm.last_pin_action_by_id,
        gm.clientOffset,
        gm.message,
        gm.createdAt created_at,
        gm.pin_updated_at
      FROM 
        group_messages gm 
        INNER JOIN users sender ON sender.id = gm.from_id 
        INNER JOIN users receiver ON receiver.id = gm.to_id 
        LEFT JOIN group_messages gms ON gm.reply_to_msg_id = gms.id 
      WHERE 
        gm.group_id = :id 
        AND gm.is_pinned = 1
      ORDER BY 
        gm.pin_updated_at DESC
    `;
    const pinnedMessages = await sequelize.query(pinnedMessagesSql, {
      type: QueryTypes.SELECT,
      replacements: {
        id,
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
export const getInitialGroupData = async (req, res, next) => {
  try {
    const result = validationResult(req);
    const userId = req.session.passport.user;

    if (!result.isEmpty()) {
      logger.log(result.array());
      throw new Error("Validation failed");
    }

    const { groupId } = matchedData(req);
    const group = await OneToOneChat.findOne({
      attributes: ["id"],
      where: {
        chat_id: groupId,
      },
      raw: true,
    });

    if (!group) throw new Error("Chat not found");
  } catch (error) {
    next(error);
  }
};
export const getGroupMessages = async (req, res, next) => {
  try {
    const result = validationResult(req);
    const userId = req.session.passport.user;
    const nextIdSql = "AND gm.id < :nextId";
    const limit = 30;
    let groupMessages;

    if (!result.isEmpty()) {
      logger.log(result.array());
      throw new Error("Validation failed");
    }

    const { groupId, nextIdParam } = matchedData(req);
    const group = await OneToOneChat.findOne({
      attributes: ["id"],
      where: {
        chat_id: groupId,
      },
      raw: true,
    });
    const groupMessagesSql = ` 
      SELECT 
        gm.id,
        gm.from_id,
        gm.to_id, 
        sender.display_name, 
        sender.username, 
        sender.profile,
        gm.clientOffset, 
        gm.message,
        gm.is_edited,
        gm.is_pinned,
        gm.request_state, 
        gm.createdAt created_at, 
        replied_msg.id replied_msg_id,
        replied_msg.message replied_msg_message,
        replied_msg.is_deleted is_replied_msg_deleted, 
        replied_msg_sender.display_name replied_msg_sender,
				replied_msg_sender.profile replied_msg_profile
      FROM 
        group_messages gm 
        INNER JOIN users sender 
          ON sender.id = gm.from_id          
        LEFT JOIN group_messages replied_msg 
          ON gm.reply_to_msg_id = replied_msg.id 
        LEFT JOIN users replied_msg_sender 
          ON replied_msg.from_id = replied_msg_sender.id 
      WHERE 
        gm.chat_id = :id
        AND 
        gm.is_deleted = 0
        ${nextId !== 0 ? nextIdSql : ""}
      ORDER BY 
        gm.createdAt DESC
      LIMIT 
        :limit
    `;
    let nextId = Number(nextIdParam);

    if (!group) throw new Error("Group not found");

    const isMember = GroupMember.findOne({
      where: {
        user_id: userId,
        group_id: group.id,
      },
    });

    if (!isMember) throw new Error("Not a member in this group");

    const { id } = group;

    groupMessages = await sequelize.query(groupMessagesSql, {
      type: QueryTypes.SELECT,
      replacements: { limit, id, nextId },
    });
    groupMessages = groupMessages.reverse();
    nextId = groupMessages.length < 30 ? null : groupMessages[0].id;

    res.status(200).json({ messages: groupMessages, nextId });
  } catch (error) {
    next(error);
  }
};
