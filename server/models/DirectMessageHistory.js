import { sequelize } from "./db.js";

export const DirectMessageHistory = sequelize.define(
  "direct_message_history",
  {},
  {
    freezeTableName: true,
    timestamps: true,
  }
);
