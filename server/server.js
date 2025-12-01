import express from "express";
import cors from "cors";
import session from "express-session";
import { sequelize } from "./models/db.js";
import { logger } from "./utils/index.js";
import SequelizeStore from "connect-session-sequelize";
import "./strategy/strategy.js";
import cookieParser from "cookie-parser";
import "dotenv/config";
import passport from "passport";
import { setUpAssociation } from "./models/associations/association.js";
import indexRouter from "./routers/index.js";
import userRouter from "./routers/user.js";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { setUpSocket } from "./socket.js";
import { createClient } from "redis";
import { DirectMessage } from "./models/DirectMessage.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
export const client = createClient({
  enable_offline_queue: false,
});
const app = express();
const sqlStore = SequelizeStore(session.Store);
const sessionStore = new sqlStore({
  db: sequelize,
  expiration: 60 * 60 * 24 * 90,
});
const sessionMiddleware = session({
  secret: "secret",
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 90,
  },
});

const server = createServer(app);
export const io = new Server(server, {
  connectionStateRecovery: {},
  cors: {
    origin: "http://localhost:8080",
    credentials: true,
  },
});

client.on("error", (err) => logger.log("Redis Client Error", err));

await client.connect();
await client.flushAll();

logger.log("Redis connected");

try {
  await sequelize.authenticate();
  setUpAssociation();
  await sequelize.sync();
  logger.log("Connection has been established successfully.");
  // const time = dayjs.tz("2025-11-17 20:10:55", "Europe/Istanbul");
  // const time2 = dayjs("2025-11-17 20:10:55").tz(`Europe/Istanbul`);
  // const time2 = dayjs.tz("Asia/Tokyo").format("YYYY-MM-DD HH:mm:ss");

  // logger.log(time2.format("YYYY-MM-DD HH:mm:ss"));

  // await DirectMessage.update(
  //   {
  //     pin_updated_at: time,
  //     is_pinned: true,
  //   },
  //   {
  //     where: {
  //       id: 583,
  //     },
  //   }
  // );
} catch (error) {
  logger.error("Unable to connect to the database:", error);
}

app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());
sessionStore.sync();
io.engine.use(sessionMiddleware);
setUpSocket(io);
app.use(indexRouter);
app.use(userRouter);

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
