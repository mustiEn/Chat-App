import { Op, QueryTypes, fn } from "sequelize";
import { DirectMessage } from "./models/DirectMessage.js";
import dayjs from "dayjs";
import { logger, lastDisconnect } from "./utils/index.js";
import { sequelize } from "./models/db.js";

export const setUpSocket = (io) => {
  io.on("connection", async (socket) => {
    const userId = socket.request.session?.passport?.user;
    const userLastDisconnect = lastDisconnect.get(userId);

    if (userLastDisconnect) lastDisconnect.delete(userId);

    logger.log("a user connected", userId);

    socket.emit("initial", userId);

    socket.on("join room", (receiverId, done) => {
      receiverId = Number(receiverId);
      const key = [userId, receiverId];
      const sorted = key.sort((a, b) => a - b);
      const room = sorted.join("_");
      socket.join(room);
      logger.log("Joined room:", room);
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
      const key = [userId, msg.receiverId];
      const room = key.sort((a, b) => a - b).join("_");
      let result;
      try {
        if (result) {
          if (result.message == msg.message && result.id == msg.id)
            logger.log("⚠️ Duplicate message, already updated");
          return done({ status: "duplicate" });
        }
        result = await DirectMessage.update(
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
        result = (await DirectMessage.findByPk(msg.id)).toJSON();

        io.to(room).emit("receive edited msgs", { result: [result] });
        logger.log("message edited");
        done({
          status: "ok",
        });
      } catch (error) {
        logger.log("❌ Unexpected error updating message:", error);
      }
    });

    socket.on("send dms", async (msg, clientOffset, isDisconnected, done) => {
      let result;
      const key = [userId, msg.receiverId];
      const room = key.sort((a, b) => a - b).join("_");

      logger.log("MSG ==>", msg);
      logger.log("USER ==>", userId);
      logger.log("ClientOffset ==>", clientOffset);
      logger.log("isDisconnected ==>", isDisconnected);

      try {
        result = (
          await DirectMessage.create({
            from_id: userId,
            to_id: msg.receiverId,
            message: msg.message,
            clientOffset: clientOffset,
            reply_to_msg: msg.reply_to_msg,
            createdAt: msg.createdAt,
            updatedAt: msg.createdAt,
          })
        ).toJSON();

        const resultSql = `
          SELECT 
            dm.id,
            dm.from_id, 
            u.display_name, 
            u.username, 
            u.profile,
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
            INNER JOIN users u ON dm.from_id = u.id 
            LEFT JOIN direct_messages replied_msg ON dm.reply_to_msg = replied_msg.id 
            LEFT JOIN users replied_msg_sender ON replied_msg.from_id = replied_msg_sender.id 
          WHERE 
            dm.id = ${result.id}
        `;

        result = await sequelize.query(resultSql, {
          type: QueryTypes.SELECT,
        });
        logger.log("MSG SAVED TO DB ==>", result);
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
      io.to(room).emit("receive dms", {
        result,
        wasDisconnected: isDisconnected,
      });
      logger.log("message sent/emitted");
      return done({
        status: "ok",
      });
    });

    socket.on("send pinned msgs", async (msg, done) => {
      logger.log(msg);
      const receiverId = Number(msg.receiverId);
      const key = [userId, receiverId];
      const room = key.sort((a, b) => a - b).join("_");
      logger.log("room:", room);
      try {
        let pinnedMessage = (await DirectMessage.findByPk(msg.id)).toJSON();

        if (!pinnedMessage) {
          return done({ status: "not found" });
        }

        await DirectMessage.update(
          {
            is_pinned: msg.isPinned,
            pin_updated_at: fn("NOW"),
            pinned_by: msg.isPinned ? userId : null,
          },
          {
            where: {
              id: msg.id,
            },
          }
        );

        if (msg.isPinned) {
          const pinnedMessagesSql = `
            SELECT 
              dm.id,
              sender.display_name, 
              sender.username, 
              sender.profile,
              dm.clientOffset,
              dm.message,
              dm.createdAt created_at,
              dm.pin_updated_at,
              dm.pinned_by
            FROM 
              direct_messages dm 
              INNER JOIN users sender ON sender.id = dm.from_id 
              INNER JOIN users receiver ON receiver.id = dm.to_id 
              LEFT JOIN direct_messages dms ON dm.reply_to_msg = dms.id 
            WHERE 
              dm.id = ${msg.id}
          `;
          [pinnedMessage] = await sequelize.query(pinnedMessagesSql, {
            type: QueryTypes.SELECT,
          });
        }

        io.to(room).emit("receive pinned msgs", {
          result: pinnedMessage,
          isPinned: msg.isPinned,
        });
        logger.log("pinned sent");
        return done({
          status: "ok",
        });
      } catch (error) {
        logger.log(error);
        return done({
          status: "error",
        });
      }
    });

    socket.on("deleted msgs", async (id, done) => {
      try {
        let message = (await DirectMessage.findByPk(msg.id)).toJSON();

        if (!message) {
          return done({ status: "not found" });
        }

        await DirectMessage.destroy({
          where: {
            id: msg.id,
          },
        });

        io.emit("deleted msgs", { result: [msg.id] });
        return done({
          status: "ok",
        });
      } catch (error) {
        logger.log(error);
        return done({
          status: "error",
        });
      }
    });
    // how does discord handle offline pinned msg update when user1 is online and 2 is off
    if (!socket.recovered) {
      logger.log("socket recovered");
      logger.log("serveroffset recovery :", socket.handshake.auth.serverOffset);

      try {
        const userLastDisconnect = lastDisconnect.get(userId);
        const wasDisconnected = false;
        const msgsSql = `
          SELECT dm.*, u.display_name
            FROM direct_messages dm
            INNER JOIN users u ON dm.from_id = u.id
            WHERE
              from_id = ${socket.handshake.auth.receiverId} AND
              to_id = ${userId} AND
              dm.id > ${socket.handshake.auth.serverOffset ?? 0}
            ORDER BY createdAt ASC
        `;
        const msgs = await sequelize.query(msgsSql, {
          type: QueryTypes.SELECT,
        });
        const editedMsgs = await DirectMessage.findAll({
          attributes: ["id", "message"],
          where: {
            from_id: socket.handshake.auth.receiverId,
            to_id: userId,
            updatedAt: {
              [Op.gte]: userLastDisconnect,
            },
            is_edited: true,
          },
          order: [["updatedAt", "ASC"]],
          raw: true,
        });
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
              AND dm.from_id = ${socket.handshake.auth.receiverId}
            )
            OR
            (
              dm.to_id = ${socket.handshake.auth.receiverId}
              AND dm.from_id = ${userId}
            ))
            AND dm.is_pinned = 1
          ORDER BY
            dm.pin_updated_at DESC
        `;
        const pinnedMessages = await sequelize.query(pinnedMessagesSql, {
          type: QueryTypes.SELECT,
        });

        socket.emit("receive dms", { result: msgs, wasDisconnected });
        socket.emit("receive edited msgs", { result: editedMsgs });
        socket.emit("receive pinned msgs", {
          result: pinnedMessages,
          isPinned: "recovery",
        });
        logger.log("recovery done");
      } catch (e) {
        logger.log("recovery error", e);
      }
    }

    socket.on("disconnect", () => {
      const time = dayjs().format("YYYY-MM-DD HH:mm:ss");
      lastDisconnect.set(userId, time);
      logger.log("user disconnected", time);
    });
  });
};
