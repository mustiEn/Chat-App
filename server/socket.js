import { Op, QueryTypes, fn } from "sequelize";
import { DirectMessage } from "./models/DirectMessage.js";
import dayjs from "dayjs";
import { logger, lastDisconnect } from "./utils/index.js";
import { sequelize } from "./models/db.js";
import { User } from "./models/User.js";
import { Friend } from "./models/Friend.js";
import { ChatId } from "./models/ChatId.js";
import { BlockedUser } from "./models/BlockedUser.js";

export const setUpSocket = (io) => {
  io.on("connection", async (socket) => {
    const userId = socket.request.session?.passport?.user;
    const sender = await User.findByPk(userId, {
      attributes: [
        "id",
        "display_name",
        "username",
        "profile",
        "createdAt",
        "about_me",
        "background_color",
      ],
      raw: true,
    });
    // const usersWithInContactSql = `
    //   SELECT
    //     chat_id
    //   FROM
    //     chat_ids
    //   WHERE
    //     from_id = :userId
    //     OR to_id = :userId

    // `;
    // const usersWithInContact = await sequelize.query(usersWithInContactSql, {
    //   type: QueryTypes.SELECT,
    //   replacements: {
    //     userId,
    //   },
    // });

    const usersWithInContact = await ChatId.findAll({
      attributes: ["chat_id"],
      where: {
        [Op.or]: [
          {
            user_id: userId,
          },
          { receiver_id: userId },
        ],
      },
      raw: true,
    });

    // if (userLastDisconnect) lastDisconnect.delete(userId);

    logger.log(`User with id => ${userId} connected`);

    socket.emit("initial", sender);
    // socket.broadcast.emit("status", { userId, status: "status1" });
    socket.join(userId);

    //^ on login, get all withincontact users which are dmhistoryusers with the logged in user and friends
    //^ then send whatever the status is (this will work only if status is online/offline).
    //^ save all related users in redis so on status change, it can be edited.If someone visits me,
    //^ receive socket emit, save this visiter so if i change status, they can see it.
    //^ Visitor will already see my statis through databas first.

    //~ create room ids, if they are friends,create one, if in teh same gruop,create one.

    //* in groups,no access to anyone regadless of friendship,only allow a msg input.

    usersWithInContact.forEach(({ chat_id }) => {
      const roomExists = Array.from(socket.rooms).includes(chat_id);

      if (!roomExists) socket.join(chat_id);
    });

    // logger.log("rooms: ", socket.rooms);

    socket.on("join room", (receiverId, done) => {
      receiverId = Number(receiverId);
      const key = [userId, receiverId];
      const room = key.sort((a, b) => a - b).join("_");
      socket.join(room);
      logger.log("Joined room:", room);
      logger.log("sender", userId);
      done({
        status: "ok",
      });
    });
    socket.on("leave room", (receiverId, done) => {
      receiverId = Number(receiverId);
      const key = [userId, receiverId];
      const room = key.sort((a, b) => a - b).join("_");
      socket.leave(room);
      done({
        status: "ok",
      });
    });
    // socket.on("send user status", (userId, status, done) => {
    //   userId = Number(userId);
    //   socket.broadcast.emit("status", { userId, status });
    //   done({
    //     status: "ok",
    //   });
    // });
    socket.on("send edited msgs", async (msg, chatId, done) => {
      let message;

      try {
        message = await DirectMessage.findByPk(msg.id, { raw: true });

        if (!message) throw new Error("Message not found");
        if (message.message == msg.message) {
          logger.log("⚠️ Duplicate message, already edited");
          return done({ status: "already edited", result: [message] });
        }

        message = await DirectMessage.update(
          {
            message: msg.message,
            updatedAt: msg.updatedAt,
            is_edited: true,
          },
          {
            where: {
              id: msg.id,
            },
          }
        );
        message = await DirectMessage.findByPk(msg.id, { raw: true });
      } catch (error) {
        logger.log("❌ Unexpected error updating message:", error);
        return done({
          status: "error",
          error: error.message,
        });
      }

      socket
        .to(chatId)
        .emit("receive edited msgs", { result: [message], chatId });
      logger.log("message edited");

      done({
        status: "ok",
        result: message,
      });
    });
    socket.on("send msg requests", async (msg, done) => {
      const receiverId = Number(msg.to_id);
      let msgObj = {
        ...msg,
        request_state: "pending",
      };
      let result;
      let chatId;

      try {
        const msgReq = await DirectMessage.create(msgObj, { raw: true });
        chatId = await ChatId.create({
          user_id: userId,
          receiver_id: receiverId,
        });

        const resultSql = `
          SELECT
            dm.id,
            dm.to_id,
            dm.from_id,
            u.display_name,
            u.username,
            u.profile,
            dm.clientOffset,
            dm.message,
            dm.is_edited,
            dm.is_pinned,
            dm.createdAt created_at,
            replied_msg.message replied_msg_message,
            replied_msg_sender.display_name replied_msg_sender,
            replied_msg_sender.profile replied_msg_profile
          FROM
            direct_messages dm
            INNER JOIN users u ON dm.from_id = u.id
            LEFT JOIN direct_messages replied_msg ON dm.reply_to_msg = replied_msg.id
            LEFT JOIN users replied_msg_sender ON replied_msg.from_id = replied_msg_sender.id
          WHERE
            dm.id = :msgReqId
        `;

        result = await sequelize.query(resultSql, {
          type: QueryTypes.SELECT,
          replacements: {
            msgReqId: msgReq.id,
          },
        });
      } catch (error) {
        if (
          error.name === "SequelizeUniqueConstraintError" &&
          error.original.code === "ER_DUP_ENTRY"
        ) {
          logger.log("⚠️ Duplicate message, already inserted");
          return done({ status: "duplicate" });
        }

        console.error("❌ Unexpected error inserting message:", error);
      }
      done({
        status: "ok",
        result,
        chatId: chatId.chat_id,
      });

      io.to(receiverId).emit("receive msg requests", {
        result,
        chatIds: [chatId.chat_id],
      });

      logger.log("REQ sent/emitted, receive msg requests", receiverId);
    });
    socket.on("send msg request acceptance", async (msg, answer, done) => {
      const { chatId } = answer.msgReq;
      let result = [{}];

      logger.log("send msg request acceptance", chatId);

      try {
        const requestMessage = await DirectMessage.findByPk(answer.msgReq.id);

        if (!requestMessage) throw new Error("Message not found");

        if (Object.keys(msg).length) {
          const newMsg = await DirectMessage.create(msg);

          const msgSql = `
            SELECT 
              dm.id,
              dm.from_id,
              dm.to_id, 
              u.display_name, 
              u.username, 
              u.profile,
              dm.clientOffset, 
              dm.message,
              dm.is_edited,
              dm.is_pinned,
              dm.request_state, 
              dm.createdAt created_at, 
              replied_msg.message replied_msg_message, 
              replied_msg_sender.display_name replied_msg_sender, 
              replied_msg_sender.profile replied_msg_profile 
            FROM 
              direct_messages dm 
              INNER JOIN users u ON dm.from_id = u.id 
              LEFT JOIN direct_messages replied_msg ON dm.reply_to_msg = replied_msg.id 
              LEFT JOIN users replied_msg_sender ON replied_msg.from_id = replied_msg_sender.id 
            WHERE 
              dm.id = :id
          `;

          result = await sequelize.query(msgSql, {
            type: QueryTypes.SELECT,
            replacements: {
              id: newMsg.id,
            },
          });
        } else {
          result = [{ ...sender, from_id: userId }];
        }

        await DirectMessage.update(
          {
            request_state: answer.status,
            // is_deleted: answer.status == "rejected" ? 1 : 0,
          },
          {
            where: {
              id: answer.msgReq.id,
            },
          }
        );
      } catch (error) {
        logger.log(error);
        return done({
          status: "error",
          error: error.message,
        });
      }

      if (answer.status == "accepted") {
        io.to(chatId).emit("receive msg request acceptance", {
          result,
          chatIds: [chatId],
        });
        socket.join(chatId);
        // logger.log("Joined chatId: ", chatId);
        // logger.log("sender", userId);
      }

      logger.log("Emit receive msg request acceptance");
      done({
        status: "ok",
        result,
        chatId,
      });
    });
    socket.on("send dms", async (msg, chatId, done) => {
      let result;

      try {
        const newMsg = await DirectMessage.create(msg, { raw: true });

        const resultSql = `
          SELECT 
            dm.id,
            dm.from_id,
            dm.to_id, 
            u.display_name, 
            u.username, 
            u.profile,
            dm.clientOffset, 
            dm.message,
            dm.is_edited,
            dm.is_pinned,
            dm.request_state, 
            dm.createdAt created_at, 
            replied_msg.message replied_msg_message, 
            replied_msg_sender.display_name replied_msg_sender, 
            replied_msg_sender.profile replied_msg_profile 
          FROM 
            direct_messages dm 
            INNER JOIN users u ON dm.from_id = u.id 
            LEFT JOIN direct_messages replied_msg ON dm.reply_to_msg = replied_msg.id 
            LEFT JOIN users replied_msg_sender ON replied_msg.from_id = replied_msg_sender.id 
          WHERE 
            dm.id = :id
        `;

        result = await sequelize.query(resultSql, {
          type: QueryTypes.SELECT,
          replacements: {
            id: newMsg.id,
          },
        });
      } catch (error) {
        if (
          error.name === "SequelizeUniqueConstraintError" &&
          error.original.code === "ER_DUP_ENTRY"
        ) {
          logger.log("⚠️ Duplicate message, already inserted");
          return done({ status: "duplicate" });
        }
        console.error("❌ Unexpected error inserting message:", error);
      }
      socket.to(chatId).emit("receive dms", {
        result,
        chatId,
      });
      logger.log("Sent dm:", result);
      done({
        status: "ok",
        result,
        chatId,
      });
    });
    socket.on("send pinned msgs", async (msg, chatId, done) => {
      let pinnedMessage;

      try {
        pinnedMessage = await DirectMessage.findByPk(msg.id, { raw: true });

        if (!pinnedMessage) throw new Error("Pinned message not found");

        await DirectMessage.update(
          {
            is_pinned: msg.isPinned,
            pin_updated_at: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
            last_pin_action_by_id: userId,
          },
          {
            where: {
              id: msg.id,
            },
          }
        );

        pinnedMessage = await DirectMessage.findByPk(msg.id, { raw: true });

        if (msg.isPinned) {
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
              dm.id = :msgId
          `;
          [pinnedMessage] = await sequelize.query(pinnedMessagesSql, {
            type: QueryTypes.SELECT,
            replacements: {
              msgId: msg.id,
            },
          });
        }
      } catch (error) {
        logger.log(error);
        return done({
          status: "error",
          error: error.message,
        });
      }

      socket.to(chatId).emit("receive pinned msgs", {
        result: pinnedMessage,
        isRecovery: false,
        chatId,
      });
      logger.log("pinned sent");
      done({
        status: "ok",
        result: pinnedMessage,
        chatId,
      });
    });
    socket.on("send deleted msgs", async (msg, chatId, done) => {
      try {
        const message = await DirectMessage.findByPk(msg.id, { raw: true });
        logger.log("message state", message);
        if (!message) throw new Error("Message not found");

        await DirectMessage.update(
          { is_deleted: true },
          {
            where: {
              id: msg.id,
            },
          }
        );
      } catch (error) {
        logger.log(error);
        return done({
          status: "error",
          error: error.message,
        });
      }

      socket.to(chatId).emit("receive deleted msgs", {
        result: [msg.id],
        userId,
        chatId,
      });
      logger.log("Deleted dm:", msg.id);
      done({
        status: "ok",
        chatId,
      });
    });
    socket.on("send removed friends", async (friendIdParam, done) => {
      const friendId = Number(friendIdParam);

      try {
        const user = await User.findByPk(friendId, { raw: true });

        if (!user) throw new Error("Friend not found");

        await Friend.destroy({
          where: {
            [Op.or]: [
              {
                user_id: userId,
                friend_id: friendId,
              },
              {
                user_id: friendId,
                friend_id: userId,
              },
            ],
          },
        });
      } catch (error) {
        return done({
          status: "error",
          error: error.message,
        });
      }
      done({
        status: "ok",
      });
      io.to(friendId).emit("receive removed friends", {
        result: [userId],
      });
      logger.log("Deleted friend:", friendId);
    });
    socket.on("send friend requests", async (friendInfo, done) => {
      let friend;

      try {
        if (friendInfo === sender.username)
          throw new Error("Something went wrong");
        if (isNaN(friendInfo)) {
          friend = await User.findOne({
            attributes: ["id"],
            where: {
              username: friendInfo,
            },
            raw: true,
          });

          if (!friend) throw new Error("User not found");

          const isFriendRequestSent = await Friend.findOne({
            where: {
              user_id: userId,
              friend_id: friend.id,
              request_state: "pending",
            },
            raw: true,
          });

          if (isFriendRequestSent)
            throw new Error("Friend request already sent");
        } else {
          friend = await User.findByPk(friendInfo, {
            attributes: ["id"],
            raw: true,
          });

          if (!friend) throw new Error("Friend not found");
        }

        const isFriend = await Friend.findOne({
          where: {
            [Op.or]: [
              {
                user_id: userId,
                friend_id: friend.id,
              },
              {
                user_id: friend.id,
                friend_id: userId,
              },
            ],
            request_state: "accepted",
          },
        });
        const isFriendBlockedByMe = await BlockedUser.findOne({
          where: {
            blocked_by_id: userId,
            blocked_id: friend.id,
          },
        });

        if (isFriend) throw new Error("You're already friends with this user");
        if (isFriendBlockedByMe)
          await BlockedUser.destroy({
            where: {
              blocked_by_id: userId,
              blocked_id: friend.id,
            },
          });

        await Friend.create({
          user_id: userId,
          friend_id: friend.id,
          request_state: "pending",
        });
        console.log(friend);
      } catch (error) {
        logger.log(error);
        return done({
          status: "error",
          error: error.message,
        });
      }
      done({
        status: "ok",
        friend: friend,
      });

      io.to(friend.id).emit("receive friend requests", {
        result: [sender],
      });
    });
    socket.on(
      "send friend request acceptance",
      async (friendIdParam, status, done) => {
        const friendId = Number(friendIdParam);
        let chat = undefined;
        let chatIdCreated;

        try {
          const friend = await User.findByPk(friendId, {
            attributes: ["id"],
            raw: true,
          });

          if (!friend) throw new Error("Friend not found");

          if (status === "accepted") {
            await Friend.update(
              {
                request_state: status,
              },
              {
                where: {
                  user_id: friendId,
                  friend_id: userId,
                },
              }
            );
            [chat, chatIdCreated] = await ChatId.findCreateFind({
              attributes: ["chat_id"],
              where: {
                [Op.or]: [
                  { user_id: userId, receiver_id: friendId },
                  { user_id: friendId, receiver_id: userId },
                ],
              },
              defaults: {
                user_id: userId,
                receiver_id: friendId,
              },
              raw: true,
            });
          } else {
            await Friend.destroy({
              where: {
                user_id: friendId,
                friend_id: userId,
              },
            });
          }
        } catch (error) {
          return done({
            status: "error",
            error: error.message,
          });
        }
        logger.log(chat);
        done({
          status: "ok",
          chatIds: [chat?.chat_id ?? null],
        });

        io.to(friendId).emit("receive friend request acceptance", {
          result: [
            {
              status,
              sender,
            },
          ],
          chatIds: [chat?.chat_id ?? null],
        });

        if (status === "accepted" && chatIdCreated) socket.join(chatId);

        logger.log("friend req accepted");
      }
    );
    socket.on("send blocked users", async (blockedUserId, chatId, done) => {
      try {
        const user = await User.findByPk(blockedUserId);

        if (!user) throw new Error("User not found");

        const isFriend = await Friend.findOne({
          where: {
            [Op.or]: [
              {
                user_id: userId,
                friend_id: blockedUserId,
              },
              {
                user_id: blockedUserId,
                friend_id: userId,
              },
            ],
            request_state: "accepted",
          },
        });
        await BlockedUser.create({
          blocked_by_id: userId,
          blocked_id: blockedUserId,
        });

        if (isFriend)
          await Friend.destroy({
            where: {
              [Op.or]: [
                {
                  user_id: userId,
                  friend_id: blockedUserId,
                },
                {
                  user_id: blockedUserId,
                  friend_id: userId,
                },
              ],
            },
          });
      } catch (error) {
        logger.log("error", error.message);
        return done({
          status: "error",
          error: error.message,
        });
      }

      done({
        status: "ok",
        result: [{ blockedUserId, chatId }],
      });
      logger.log("done");
      socket.leave(chatId);

      io.emit("receive blocked users", {
        result: [{ blockedBy: userId, chatId }],
      });
    });
    socket.on("send unblocked users", async (unblockedUserId, done) => {
      try {
        const user = await User.findByPk(unblockedUserId);

        if (!user) throw new Error("User not found");

        await BlockedUser.destroy({
          where: {
            blocked_by_id: userId,
            blocked_id: unblockedUserId,
          },
        });
      } catch (error) {
        logger.log("error", error.message);
        return done({
          status: "error",
          error: error.message,
        });
      }

      done({
        status: "ok",
        result: [unblockedUserId],
      });
      logger.log("done");

      io.emit("receive unblocked users", {
        result: [userId],
      });
    });

    if (!socket.recovered) {
      const userLastDisconnect = lastDisconnect.get(userId);
      logger.log("socket recovered");
      // logger.log("serveroffset recovery :", socket.handshake.auth.serverOffset);
      // logger.log(lastDisconnect.get(userId));

      try {
        const obj = socket.handshake.auth.serverOffset;
        logger.log(obj);
        if (userLastDisconnect && Object.keys(obj).length) {
          for (const receiverId in obj) {
            const serverOffset = obj[receiverId];
            logger.log("userid", userId);
            logger.log(serverOffset, receiverId);
            const key = `${[userId, receiverId]
              .sort((a, b) => a - b)
              .join("-")}`;
            const { chat_id: chatId } = await ChatId.findOne({
              attributes: ["chat_id"],
              where: {
                chat_key: key,
              },
              raw: true,
            });
            const messagesSql = `
              SELECT 
                dm.id,
                dm.from_id,
                dm.to_id, 
                u.display_name, 
                u.username, 
                u.profile,
                dm.clientOffset, 
                dm.message,
                dm.is_edited,
                dm.is_pinned,
                dm.request_state, 
                dm.createdAt created_at, 
                replied_msg.message replied_msg_message, 
                replied_msg_sender.display_name replied_msg_sender, 
                replied_msg_sender.profile replied_msg_profile 
              FROM direct_messages dm
              INNER JOIN users u ON dm.from_id = u.id
              LEFT JOIN direct_messages replied_msg 
                ON dm.reply_to_msg = replied_msg.id 
              LEFT JOIN users replied_msg_sender 
                ON replied_msg.from_id = replied_msg_sender.id
              WHERE
                dm.from_id = :receiverId 
                AND dm.to_id = :userId 
                AND dm.id > :serverOffset
                AND dm.is_deleted = 0
              ORDER BY dm.createdAt ASC
            `;
            const pinnedMessagesSql = `
              SELECT
                dm.id,
                sender.display_name,
                sender.username,
                sender.profile,
                dm.from_id,
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
                (	            
                  dm.to_id = :userId
                  OR
                  dm.from_id = :userId
                )
                AND dm.is_deleted = 0 # deletedMsgsSql already covers unpinned msgs on frontend
                AND dm.last_pin_action_by_id = :receiverId
                AND dm.pin_updated_at >= :lastDisconnect
              ORDER BY
                dm.pin_updated_at DESC
            `;
            const [messages, editedMessages, pinnedMessages, deletedMessages] =
              await Promise.all([
                sequelize.query(messagesSql, {
                  type: QueryTypes.SELECT,
                  replacements: {
                    receiverId,
                    userId,
                    serverOffset,
                  },
                }),
                DirectMessage.findAll({
                  attributes: ["id", "message", "from_id"],
                  where: {
                    from_id: receiverId,
                    to_id: userId,
                    updatedAt: {
                      [Op.gte]: userLastDisconnect,
                    },
                    is_edited: true,
                  },
                  order: [["updatedAt", "ASC"]],
                  raw: true,
                }),
                sequelize.query(pinnedMessagesSql, {
                  type: QueryTypes.SELECT,
                  replacements: {
                    userId,
                    receiverId,
                    lastDisconnect: userLastDisconnect,
                  },
                }),
                DirectMessage.findAll({
                  attributes: ["id"],
                  where: {
                    to_id: userId,
                    from_id: receiverId,
                    updatedAt: {
                      [Op.gte]: userLastDisconnect,
                    },
                    is_deleted: 1,
                  },
                  raw: true,
                }),
              ]);

            if (messages.length) {
              socket.emit("receive dms", { result: messages, chatId });
            }
            if (editedMessages.length) {
              socket.emit("receive edited msgs", {
                result: editedMessages,
                chatId,
              });
            }
            if (pinnedMessages.length) {
              socket.emit("receive pinned msgs", {
                result: pinnedMessages,
                isRecovery: true,
                chatId,
              });
            }
            if (deletedMessages.length) {
              socket.emit("receive deleted msgs", {
                result: deletedMessages,
                chatId,
              });
            }
            logger.log(deletedMessages);
          }

          const msgRequestAcceptanceSql = `
            SELECT 
              dm.id, 
              temp2.from_id, 
              dm.to_id, 
              dm.clientOffset, 
              dm.message, 
              dm.is_edited, 
              dm.is_pinned, 
              dm.request_state, 
              dm.createdAt created_at 
            FROM 
              direct_messages dm 
              RIGHT JOIN (
                SELECT 
                  MAX(dm2.id) id, 
                  MAX(temp.from_id) from_id, 
                  MAX(dm2.message), 
                  MAX(dm2.request_state), 
                  MAX(dm2.createdAt) created_at 
                FROM 
                  direct_messages dm2 
                  RIGHT JOIN (
                    SELECT 
                      dm3.to_id from_id 
                    FROM 
                      direct_messages dm3 
                    WHERE 
                      dm3.from_id = :userId 
                      AND dm3.request_state = "accepted" 
                      AND dm3.createdAt >= :lastDisconnect
                  ) temp ON dm2.from_id = temp.from_id 
                  AND dm2.createdAt >= :lastDisconnect 
                GROUP BY 
                  dm2.from_id
              ) temp2 ON temp2.id = dm.id
          `;
          const msgRequestsSql = `
            SELECT 
              dm.id, 
              dm.from_id, 
              dm.to_id, 
              u.display_name, 
              u.username, 
              u.profile, 
              dm.clientOffset, 
              dm.message, 
              dm.is_edited, 
              dm.is_pinned, 
              dm.request_state, 
              dm.createdAt created_at 
            FROM 
              direct_messages dm 
              INNER JOIN users u ON u.id = dm.from_id 
            WHERE 
              dm.to_id = :userId 
              AND dm.request_state = "pending" 
              AND dm.createdAt >= :lastDisconnect
          `;
          const friendRequestsSql = `
            SELECT 
              u.id, u.username, u.display_name, u.profile 
            FROM 
              friends f
              INNER JOIN users u ON u.id = f.user_id 
            WHERE 
              user_id = :userId
              AND request_state = "pending"
              AND f.createdAt > :lastDisconnect            
          `;
          const friendRequestsAcceptanceSql = `
            SELECT 
              u.id,
              u.display_name,
              u.username,
              u.profile,
              f.request_state status
            FROM 
              friends f 
              INNER JOIN users u ON u.id = f.friend_id 
            WHERE 
              f.user_id = :userId 
              AND f.request_state = "accepted" 
              AND f.createdAt > :lastDisconnect 
            UNION 
            SELECT 
              u.id,
              u.display_name,
              u.username,
              u.profile,
              f.request_state status
            FROM 
              friends f 
              INNER JOIN users u ON u.id = f.friend_id 
            WHERE 
              f.user_id = :userId 
              AND f.request_state = "rejected" 
              AND f.createdAt > :lastDisconnect 
          `;
          const [
            friendRequests,
            friendRequestsAcceptance,
            msgRequestAcceptance,
            msgRequests,
            blockedUsers,
          ] = await Promise.all([
            sequelize.query(friendRequestsSql, {
              type: QueryTypes.SELECT,
              replacements: {
                userId,
                lastDisconnect: userLastDisconnect,
              },
            }),
            sequelize.query(friendRequestsAcceptanceSql, {
              type: QueryTypes.SELECT,
              replacements: {
                userId,
                lastDisconnect: userLastDisconnect,
              },
            }),
            sequelize.query(msgRequestAcceptanceSql, {
              type: QueryTypes.SELECT,
              replacements: {
                userId,
                lastDisconnect: userLastDisconnect,
              },
            }),
            sequelize.query(msgRequestsSql, {
              type: QueryTypes.SELECT,
              replacements: {
                userId,
                lastDisconnect: userLastDisconnect,
              },
            }),
            BlockedUser.findAll({
              attributes: ["blocked_id"],
              blocked_by_id: userId,
              updatedAt: {
                [Op.gte]: userLastDisconnect,
              },
              raw: true,
            }),
          ]);

          if (msgRequestAcceptance.length) {
            socket.emit("receive msg request acceptance", {
              result: msgRequestAcceptance,
            });
          }
          if (msgRequests.length) {
            const chatIds = [];

            for (const element of msgRequests) {
              const { from_id, to_id } = element;
              const key = [from_id, to_id].sort((a, b) => a - b).join("-");
              const { chat_id } = await ChatId.findOne({
                attributes: ["chat_id"],
                where: {
                  chat_key: key,
                },
                raw: true,
              });
              chatIds.push(chat_id);
            }

            socket.emit("receive msg requests", {
              result: msgRequests,
              chatIds,
            });
          }
          if (friendRequestsAcceptance.length) {
            const chatIds = [];

            for (const element of friendRequestsAcceptance) {
              const { id: friendId, status } = element;
              const key = [friendId, userId].sort((a, b) => a - b).join("-");
              const [chatId, chatIdCreated] = await ChatId.findCreateFind({
                attributes: ["chat_id"],
                where: {
                  chat_key: key,
                },
                defaults: {
                  user_id: userId,
                  receiver_id: friendId,
                },
                raw: true,
              });

              if (status === "accepted" && chatIdCreated)
                socket.join(chatId.chat_id);
              chatIds.push(chatId.chat_id);
            }

            socket.emit("receive friend request acceptance", {
              result: friendRequestsAcceptance,
              chatIds,
            });
          }
          if (friendRequests.length) {
            socket.emit("receive friend requests", {
              sender,
              result: friendRequests,
            });
          }
          if (blockedUsers.length) {
            socket.emit("receive blocked users", {
              result: blockedUsers,
            });
          }
        }
      } catch (e) {
        logger.log("recovery error", e);
      }
      logger.log("recovery done");
    }

    socket.on("disconnect", () => {
      const time = dayjs().format("YYYY-MM-DD HH:mm:ss");
      lastDisconnect.set(userId, time);
      logger.log("user disconnected", time);
    });
  });
};
