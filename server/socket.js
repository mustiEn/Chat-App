import { Op, QueryTypes } from "sequelize";
import { DirectMessage } from "./models/DirectMessage.js";
import dayjs from "dayjs";
import { logger } from "./utils/index.js";
import { sequelize } from "./models/db.js";

let time;
export const setUpSocket = (io) => {
  io.on("connection", async (socket) => {
    const userId = socket.request.session.passport.user;

    console.log("a user connected", userId);

    socket.emit("initial", userId);

    socket.on("join room", (receiverId, done) => {
      receiverId = Number(receiverId);
      const key = [userId, receiverId];
      const sorted = key.sort((a, b) => a - b);
      const room = sorted.join("_");
      socket.join(room);
      console.log("joined room", room);

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
      console.log("left room", room);
    });

    socket.on("Edited msg", async (msg, done) => {
      let result;
      try {
        if (result) {
          if (result.message == msg.message && result.id == msg.id)
            console.log("⚠️ Duplicate message, already updated");
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
      } catch (error) {
        console.log("❌ Unexpected error updating message:", error);
      }

      io.emit("Edited msg", { msg: result, wasDisconnected: true });
      console.log("message edited");
      done({
        status: "ok",
      });
    });

    socket.on("dm", async (msg, clientOffset, wasDisconnected, done) => {
      let result;
      console.log("message: " + msg.message);

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
      } catch (error) {
        if (
          error.name === "SequelizeUniqueConstraintError" &&
          error.original.code === "ER_DUP_ENTRY"
        ) {
          console.log("⚠️ Duplicate message, already inserted");
          return done({ status: "duplicate" });
        }

        console.error("❌ Unexpected error inserting message:", error);
      }

      io.emit("dm", { msg: result, wasDisconnected: wasDisconnected });
      console.log("message sent");
      done({
        status: "ok",
      });
    });

    if (!socket.recovered) {
      logger.log("back", time);
      console.log(
        "serveroffset recovery :",
        socket.handshake.auth.serverOffset
      );
      try {
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
          where: {
            from_id: userId,
            to_id: socket.handshake.auth.receiverId,
            updatedAt: {
              [Op.gte]: time,
            },
            is_edited: true,
          },
          order: [["updatedAt", "ASC"]],
          raw: true,
        });

        for (const msg of msgs) {
          socket.emit("dm", { msg: msg, wasDisconnected: false });
        }
        socket.emit("Edited msgs", {
          editedMsgs: editedMsgs,
          wasDisconnected: false,
        });
        console.log("recovery done");
      } catch (e) {
        console.log("recovery error", e);
      }
    }

    socket.on("disconnect", () => {
      time = dayjs().format("YYYY-MM-DD HH:mm:ss");
      console.log("user disconnected", time);
    });
  });
};
