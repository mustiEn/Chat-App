import { Op, QueryTypes, fn } from "sequelize";
import { DirectMessage } from "./models/DirectMessage.js";
import dayjs from "dayjs";
import { logger } from "./utils/index.js";
import { sequelize } from "./models/db.js";

let time;
export const setUpSocket = (io) => {
  io.on("connection", async (socket) => {
    const userId = socket.request.session?.passport?.user;

    logger.log("a user connected", userId);

    socket.emit("initial", userId);

    socket.on("join room", (receiverId, done) => {
      receiverId = Number(receiverId);
      const key = [userId, receiverId];
      const sorted = key.sort((a, b) => a - b);
      const room = sorted.join("_");
      socket.join(room);
      logger.log("joined room", room);

      done({
        status: "ok",
      });
    });

    socket.on("leave room", (receiverId, done) => {
      receiverId = Number(receiverId);
      const key = [userId, receiverId];
      const sorted = key.sort((a, b) => a - b);
      const room = sorted.join("_");
      socket.leave(room);
      done({
        status: "ok",
      });
      logger.log("left room", room);
    });

    socket.on("edited msgs", async (msg, done) => {
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

        io.emit("edited msgs", { result: [result] });
        logger.log("message edited");
        done({
          status: "ok",
        });
      } catch (error) {
        logger.log("❌ Unexpected error updating message:", error);
      }
    });

    socket.on("dms", async (msg, clientOffset, wasDisconnected, done) => {
      let result;
      logger.log("message: " + msg.message);

      try {
        result = (
          await DirectMessage.create({
            from_id: userId,
            to_id: msg.receiverId,
            message: msg.message,
            createdAt: msg.createdAt,
            updatedAt: msg.createdAt,
            clientOffset: clientOffset,
          })
        ).toJSON();

        const resutlSql = `
          SELECT dm.*,u.display_name
            FROM direct_messages dm
            INNER JOIN users u ON dm.from_id = u.id
            WHERE dm.id = ${result.id}
        `;

        [result] = await sequelize.query(resutlSql, {
          type: QueryTypes.SELECT,
        });
        io.emit("dms", { msg: result, wasDisconnected: wasDisconnected });
        logger.log("message sent");
        done({
          status: "ok",
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
    });

    socket.on("pinned msgs", async (msg, done) => {
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

        io.emit("pinned msgs", {
          result: pinnedMessage,
          isPinned: msg.isPinned,
        });
        return done({
          status: "ok",
        });
      } catch (error) {
        logger.log(error);
      }
    });

    if (!socket.recovered) {
      logger.log("socket recovered");
      logger.log("back", time);
      logger.log("serveroffset recovery :", socket.handshake.auth.serverOffset);
      try {
        const wasDisconnected = false;
        const msgsSql = `
          SELECT *
            FROM direct_messages 
            WHERE 
              from_id = ${socket.handshake.auth.receiverId} AND
              to_id = ${userId} AND
              id > ${socket.handshake.auth.serverOffset ?? 0}
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
              [Op.gte]: time,
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
            ${time ? `AND dm.pin_updated_at >= "${time}"` : ""}
          ORDER BY 
            dm.pin_updated_at DESC
        `;
        const pinnedMessages = await sequelize.query(pinnedMessagesSql, {
          type: QueryTypes.SELECT,
        });

        for (const msg of msgs) {
          socket.emit("dms", { msg: msg, wasDisconnected });
        }

        socket.emit("edited msgs", { result: editedMsgs });
        socket.emit("pinned msgs", {
          result: pinnedMessages,
          isPinned: null,
        });
        logger.log("recovery done");
      } catch (e) {
        logger.log("recovery error", e);
      }
    }

    socket.on("disconnect", () => {
      time = dayjs().format("YYYY-MM-DD HH:mm:ss");
      logger.log("user disconnected", time);
    });
  });
};
