import { NUMBER, Op, QueryTypes, fn } from "sequelize";
import { DirectMessage } from "./models/DirectMessage.js";
import dayjs from "dayjs";
import { logger, lastDisconnect } from "./utils/index.js";
import { sequelize } from "./models/db.js";
import { User } from "./models/User.js";
import { Friend } from "./models/Friend.js";

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
    const usersWithInContactSql = `
      SELECT 
        DISTINCT IF(from_id = :userId, to_id, from_id) AS user_id 
      FROM 
        direct_messages 
      WHERE 
        from_id = :userId 
        OR to_id = :userId
      
      UNION
      
      SELECT 
        friend_id 
      FROM 
        friends 
      WHERE 
        user_id = :userId
    `;
    const usersWithInContact = await sequelize.query(usersWithInContactSql, {
      type: QueryTypes.SELECT,
      replacements: {
        userId,
      },
    });

    //? REDIS GET ONLINE FRIENDS

    // if (userLastDisconnect) lastDisconnect.delete(userId);

    logger.log(`User with id => ${userId} connected`);

    socket.emit("initial", sender);
    socket.join(userId);

    usersWithInContact.forEach((e) => {
      // logger.log(e);
      const receiverId = e.user_id;
      const key = [userId, receiverId];
      const room = key.sort((a, b) => a - b).join("_");
      const roomExists = Array.from(socket.rooms).includes(room);

      if (!roomExists) socket.join(room);
    });

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
    socket.on("send edited msgs", async (msg, done) => {
      const receiverId = Number(msg.toId);
      const key = [userId, receiverId];
      const room = key.sort((a, b) => a - b).join("_");
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

      socket.to(room).emit("receive edited msgs", { result: [message] });
      logger.log("message edited");

      done({
        status: "ok",
        result: message,
      });
    });
    socket.on("send msg requests", async (msg, done) => {
      const receiverId = Number(msg.to_id);
      let result;

      msg = {
        ...msg,
        request_state: "pending",
      };

      try {
        result = await DirectMessage.create(msg, { raw: true });

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
            dm.id = ${result.id}
        `;

        result = await sequelize.query(resultSql, {
          type: QueryTypes.SELECT,
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
      io.to(receiverId).emit("receive msg requests", {
        result,
      });
      logger.log("REQ sent/emitted, receive msg requests", receiverId);
      done({
        status: "ok",
        result,
      });
    });
    socket.on("send msg request acceptance", async (msg, answer, done) => {
      const receiverId = Number(answer.reqMsg.from_id);
      const key = [userId, receiverId];
      const room = key.sort((a, b) => a - b).join("_");
      let result = [{}];

      logger.log("send msg request acceptance", receiverId);

      try {
        const requestMessage = await DirectMessage.findByPk(answer.reqMsg.id);

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
          result[0].from_id = userId;
        }

        await DirectMessage.update(
          {
            request_state: answer.status,
            // is_deleted: answer.status == "rejected" ? 1 : 0,
          },
          {
            where: {
              id: answer.reqMsg.id,
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
        io.to(receiverId).emit("receive msg request acceptance", {
          result,
        });
        socket.join(room);
        logger.log("Joined room: ", room);
        logger.log("sender", userId);
      }

      logger.log("Emit receive msg request acceptance");
      done({
        status: "ok",
        result,
      });
    });
    socket.on("send dms", async (msg, done) => {
      let result;
      const key = [userId, Number(msg.to_id)];
      const room = key.sort((a, b) => a - b).join("_");

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
      socket.to(room).emit("receive dms", {
        result,
        sender,
      });
      logger.log("Sent dm:", result);
      return done({
        status: "ok",
        result,
      });
    });
    socket.on("send pinned msgs", async (msg, done) => {
      const receiverId = Number(msg.toId);
      const room = [userId, receiverId].sort((a, b) => a - b).join("_");
      let pinnedMessage;

      try {
        pinnedMessage = await DirectMessage.findByPk(msg.id, { raw: true });

        if (!pinnedMessage) throw new Error("Pinned message not found");

        await DirectMessage.update(
          {
            is_pinned: msg.isPinned,
            pin_updated_at: fn("NOW"),
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

      socket.to(room).emit("receive pinned msgs", {
        result: pinnedMessage,
        isRecovery: false,
      });
      logger.log("pinned sent");
      return done({
        status: "ok",
        result: pinnedMessage,
      });
    });
    socket.on("send deleted msgs", async (msg, done) => {
      const key = [userId, Number(msg.to_id)];
      const room = key.sort((a, b) => a - b).join("_");

      try {
        let message = await DirectMessage.findByPk(msg.id, { raw: true });
        logger.log("message state", message);
        if (!message) return done({ status: "not found" });

        // await DirectMessage.update(
        //   { is_deleted: true },
        //   {
        //     where: {
        //       id: msg.id,
        //     },
        //   }
        // );
      } catch (error) {
        logger.log(error);
        return done({
          status: "error",
          error: error.message,
        });
      }

      socket.to(room).emit("receive deleted msgs", {
        result: [msg.id],
        userId,
      });
      logger.log("Deleted dm:", msg.id);
      return done({
        status: "ok",
      });
    });
    socket.on("send removed friends", async (friendId, done) => {
      const key = [userId, Number(friendId)];
      const room = key.sort((a, b) => a - b).join("_");

      try {
        const user = await User.findByPk(friendId, { raw: true });
        const friendSql = `
          DELETE FROM friends 
          WHERE 
            (
              userId = :userId
              AND 
              friend_id = :friendId
            )
            OR
            (
              userId = :friendId
              AND 
              friend_id = :userId
            )
        `;

        // if (!user) throw new Error("Friend not found");

        // await sequelize.query(friendSql, {
        //   replacements: {
        //     userId,
        //     friendId,
        //   },
        // });
      } catch (error) {
        return done({
          status: "error",
          error: error.message,
        });
      }
      done({
        status: "ok",
      });
      socket.to(room).emit("receive removed friends", {
        result: [userId],
      });
      logger.log("Deleted friend:", friendId);
    });
    socket.on("send friend requests", async (friendInfo, done) => {
      let friend;

      try {
        if (isNaN(friendInfo)) {
          if (friendInfo === sender.username)
            throw new Error("Something went wrong");

          friend = await User.findOne({
            where: {
              username: friendInfo,
            },
            raw: true,
          });
          const requestExistsSql = `
            SELECT 
              COUNT(*) val 
            FROM 
              friends 
            WHERE 
              user_id = :userId 
              AND friend_id = :friendId
              AND request_state = "pending"
          `;
          const [requestExists] = await sequelize.query(requestExistsSql, {
            type: QueryTypes.SELECT,
            replacements: {
              userId,
              friendId: friend.id,
            },
          });
          logger.log(requestExists);
          if (requestExists.val) throw new Error("Friend request already sent");
        } else {
          friend = await User.findByPk(friendInfo, { raw: true });
        }

        if (!friend) throw new Error("Friend not found");

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

        if (isFriend) throw new Error("You're already friends with this user");

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

      io.to(Number(friend.id)).emit("receive friend requests", {
        result: [sender],
      });
    });
    socket.on(
      "send friend request acceptance",
      async (friendId, status, done) => {
        const receiverId = Number(friendId);
        const key = [userId, receiverId];
        const room = key.sort((a, b) => a - b).join("_");
        let result = [];

        try {
          const user = await User.findByPk(friendId, { raw: true });

          if (!user) throw new Error("Friend not found");

          result.push({
            sender,
            status,
          });

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
        done({
          status: "ok",
        });

        io.to(receiverId).emit("receive friend request acceptance", {
          result,
        });

        if (status === "accepted") {
          const roomExists = Array.from(socket.rooms).includes(room);

          if (!roomExists) socket.join(room);
        }
        logger.log("friend req accepted");
      }
    );

    if (!socket.recovered) {
      const userLastDisconnect = lastDisconnect.get(userId);
      logger.log("socket recovered");
      // logger.log("serveroffset recovery :", socket.handshake.auth.serverOffset);
      // logger.log(lastDisconnect.get(userId));

      try {
        const obj = socket.handshake.auth.serverOffset;

        if (userLastDisconnect && Object.keys(obj).length) {
          for (const receiverId in obj) {
            const serverOffset = obj[receiverId];
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
            const deletedMessagesSql = `
              SELECT 
                dm.id, 
                dm.from_id 
              FROM 
                direct_messages dm 
              WHERE 
                dm.to_id = :userId 
                AND dm.from_id = :receiverId 
                AND dm.updatedAt >= :lastDisconnect
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
                sequelize.query(deletedMessagesSql, {
                  type: QueryTypes.SELECT,
                  replacements: {
                    userId,
                    receiverId,
                    lastDisconnect: userLastDisconnect,
                  },
                }),
              ]);

            if (messages.length)
              socket.emit("receive dms", { result: messages });
            if (editedMessages.length)
              socket.emit("receive edited msgs", { result: editedMessages });
            if (pinnedMessages.length)
              socket.emit("receive pinned msgs", {
                result: pinnedMessages,
                isRecovery: true,
              });
            if (deletedMessages.length)
              socket.emit("receive deleted msgs", {
                result: deletedMessages,
              });

            // logger.log(`ReceiverId: ${receiverId}`);
            // logger.log("Dms:", messages);
            // logger.log("EditedMsgs:", editedMessages);
            // logger.log("Pinnedmsgs:", pinnedMessages);
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
          const [msgRequestAcceptance, msgRequests] = await Promise.all([
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
          ]);

          if (msgRequestAcceptance.length)
            socket.emit("receive msg request acceptance", {
              result: msgRequestAcceptance,
            });
          if (msgRequests.length)
            socket.emit("receive msg requests", {
              sender,
              result: msgRequests,
            });
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
