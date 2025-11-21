import { sequelize } from "./db.js";

export const BlockedUser = sequelize.define(
  "blocked_user",
  {},
  { timestamps: true }
);
