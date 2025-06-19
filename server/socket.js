import { Op } from "sequelize";
import { DirectMessage } from "./models/DirectMessage.js";

export const setUpSocket = (io) => {
  io.on("connection", async (socket) => {
    console.log("a user connected");

    const userId = socket.request.session.passport.user;

    socket.emit("inital", userId);

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

    socket.on("dm", async (msg, clientOffset, done) => {
      let result;
      console.log("message: " + msg.message);
      console.log(
        "serveroffset new message :",
        socket.handshake.auth.serverOffset
      );
      console.log("clientoffset new message : ", clientOffset);

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
      io.emit("dm", { msg: result, state: true });
      console.log("message sent");

      done({
        status: "ok",
      });
    });

    if (!socket.recovered) {
      // if the connection state recovery was not successful
      console.log(
        "serveroffset recovery :",
        socket.handshake.auth.serverOffset
      );
      try {
        const msgs = await DirectMessage.findAll({
          where: {
            from_id: socket.handshake.auth.receiverId,
            to_id: userId,
            id: {
              [Op.gt]: socket.handshake.auth.serverOffset,
            },
          },
          order: [["createdAt", "ASC"]],

          raw: true,
        });
        msgs;

        for (const msg of msgs) {
          socket.emit("dm", { msg: msg, state: false });
        }
        console.log("recovery done");
      } catch (e) {
        console.log("recovery error", e);
      }
    }

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};
